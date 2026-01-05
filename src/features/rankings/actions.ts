'use server';

import { createClient } from '@/lib/supabase/server';

export type RankingType =
    | 'director'
    | 'screenplay'
    | 'photography'
    | 'music'
    | 'actor'
    | 'genre'
    | 'year';

export type RankingItem = {
    name: string;
    count: number;
    movies: {
        id: string;
        title: string;
        year: number;
        poster_url: string | null;
        user_rating?: number;
    }[];
    image_url?: string; // Nuevo: Foto del director/actor/etc
    // Metadatos específicos para actores
    roles?: string[]; // Roles distintos interpretados
    is_saga?: boolean; // Si roles.length < movies.length
};

type RankingOptions = {
    minRating?: number;
    limit?: number;
};

export async function getRanking(
    userId: string, // Implícito desde auth, pero se mantiene por flexibilidad en la firma
    type: RankingType,
    options: RankingOptions = {}
): Promise<RankingItem[]> {
    const supabase = await createClient();
    const { minRating = 10, limit = 10 } = options;

    // 1. Obtener reseñas relevantes con datos de películas
    // Obtenemos "extended_data" para info de crew/cast.
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            rating,
            movies (
                id,
                title,
                year,
                poster_url,
                director, 
                genres,
                extended_data
            )
        `)
        .eq('user_id', userId)
        .gte('rating', minRating);

    if (error || !reviews) {
        console.error('Error obteniendo datos para el ranking:', error);
        throw new Error('Fallo al obtener métricas de ranking');
    }

    // 2. Agregar Datos
    const groups: Record<string, RankingItem> = {};

    reviews.forEach((review) => {
        const movie = review.movies;
        // @ts-ignore la inferencia de relación podría ser array/objeto según configuración
        const m = Array.isArray(movie) ? movie[0] : movie;
        if (!m) return;

        const movieSimple = {
            id: m.id,
            title: m.title || 'Desconocido',
            year: m.year || 0,
            poster_url: m.poster_url,
            user_rating: review.rating || undefined
        };

        const keys: string[] = [];
        const extraData: Record<string, any> = {};
        const keyImages: Record<string, string> = {}; // Nuevo: Mapa de imágenes para los keys

        // Helper para buscar imagen en crew_details o cast
        const findImage = (name: string) => {
            const ext = m.extended_data as any;
            // 1. Buscar en crew_details (nuevo campo)
            const crew = ext?.crew_details?.find((c: any) => c.name === name);
            if (crew?.photo) return crew.photo;
            // 2. Buscar en cast (fallback, muchos directores son actores)
            const cast = ext?.cast?.find((c: any) => c.name === name);
            if (cast?.photo) return cast.photo;
            return undefined;
        };

        // Extraer claves basadas en el Tipo
        switch (type) {
            case 'director':
                // Usar columna director top-level o extended_data
                if (m.director) {
                    // Separar directores por coma
                    m.director.split(',').forEach((d: string) => {
                        const name = d.trim();
                        keys.push(name);
                        // Intentar obtener foto
                        const img = findImage(name);
                        if (img) keyImages[name] = img;
                    });
                }
                break;
            case 'genre':
                // Chequear géneros top-level (array o json)
                if (Array.isArray(m.genres)) {
                    keys.push(...m.genres.map((g: any) => String(g)));
                }
                else if (m.extended_data?.technical?.genres) {
                    keys.push(...m.extended_data.technical.genres);
                }
                break;
            case 'year':
                if (m.year) keys.push(String(m.year));
                break;
            case 'screenplay':
                if (m.extended_data?.crew?.screenplay) {
                    const name = m.extended_data.crew.screenplay;
                    keys.push(name);
                    const img = findImage(name);
                    if (img) keyImages[name] = img;
                }
                break;
            case 'photography':
                if (m.extended_data?.crew?.photography) {
                    const name = m.extended_data.crew.photography;
                    keys.push(name);
                    const img = findImage(name);
                    if (img) keyImages[name] = img;
                }
                break;
            case 'music':
                if (m.extended_data?.crew?.music) {
                    const name = m.extended_data.crew.music;
                    keys.push(name);
                    const img = findImage(name);
                    if (img) keyImages[name] = img;
                }
                break;
            case 'actor':
                if (Array.isArray(m.extended_data?.cast)) {
                    m.extended_data.cast.forEach((c: any) => {
                        // ¿Solo contar actores principales? ¿O todos? Por ahora tomamos todos.
                        if (c.name) {
                            keys.push(c.name);
                            // Guardar rol para este actor
                            if (!extraData[c.name]) extraData[c.name] = [];
                            extraData[c.name].push(c.role);
                            // Guardar foto del actor si existe
                            if (c.photo) keyImages[c.name] = c.photo;
                        }
                    });
                }
                break;
        }

        // Deduplicar claves para prevenir agregar la misma película múltiples veces al mismo grupo
        // Esto arregla el error de "Duplicate keys" en React
        const uniqueKeys = Array.from(new Set(keys));

        // Agregar a Grupos
        uniqueKeys.forEach(key => {
            if (!key) return;
            if (!groups[key]) {
                groups[key] = {
                    name: key,
                    count: 0,
                    movies: [],
                    roles: [],
                    image_url: undefined // Inicializar
                };
            }
            groups[key].count++;
            groups[key].movies.push(movieSimple);

            // Asignar imagen si no tiene una y encontramos una nueva
            if (!groups[key].image_url && keyImages[key]) {
                groups[key].image_url = keyImages[key];
            }

            if (type === 'actor' && extraData[key]) {
                // Aplanar roles
                groups[key].roles?.push(...extraData[key]);
            }
        });
    });

    // 3. Post-proceso (Ordenar y Limitar)
    let sorted = Object.values(groups).sort((a, b) => b.count - a.count);

    // Limitar
    if (limit > 0) {
        sorted = sorted.slice(0, limit);
    }

    // Matiz Adicional para Actores
    if (type === 'actor') {
        sorted.forEach(item => {
            if (item.roles) {
                // Roles únicos
                const uniqueRoles = Array.from(new Set(item.roles));
                item.is_saga = uniqueRoles.length < item.movies.length; // Más películas que roles únicos = reuso (saga)
                item.roles = uniqueRoles;
            }
        });
    }

    // Ordenar películas dentro de cada grupo por año? O rating?
    // "Luego por orden ascendente de año de realización"
    sorted.forEach(item => {
        item.movies.sort((a, b) => a.year - b.year);
    });

    return sorted;
}
