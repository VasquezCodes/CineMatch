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
    roles?: { role: string; movies: string[] }[]; // Roles agrupados por nombre
    is_saga?: boolean; // Si roles.length < movies.length
    score?: number; // Puntuación calculada para ordenamiento
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

    // 1. Obtener items del watchlist con rating
    // Cambiamos de 'reviews' a 'watchlists' ya que parece ser la fuente de verdad actualizada
    const { data: watchlistItems, error } = await supabase
        .from('watchlists')
        .select(`
            user_rating,
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
        .gte('user_rating', minRating);

    if (error || !watchlistItems) {
        console.error('Error obteniendo datos para el ranking:', error);
        throw new Error('Fallo al obtener métricas de ranking');
    }

    // Adaptamos la lógica de mapeo
    const reviews = watchlistItems.map(item => ({
        rating: item.user_rating,
        movies: item.movies
    }));

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
        const extraData: Record<string, { name: string; movieTitle: string }[]> = {};
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
                            // @ts-ignore - Estructura temporal, transformada en el post-proceso
                            extraData[c.name].push({ name: c.role, movieTitle: m.title || 'Desconocido' });
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
                // @ts-ignore
                groups[key].roles?.push(...extraData[key]);
            }
        });
    });

    // 3. Post-proceso (Ordenar y Limitar)
    // Para actores, calculamos un score especial
    let sorted = Object.values(groups).map(item => {
        if (type === 'actor') {
            const allRoles = item.roles || [];
            // Agrupar roles por nombre
            const roleMap = new Map<string, string[]>();
            allRoles.forEach((r: any) => {
                // @ts-ignore manejando estado intermedio donde r es { name, movieTitle }
                const roleName = r.name;
                // @ts-ignore
                const movieTitle = r.movieTitle;

                if (!roleMap.has(roleName)) roleMap.set(roleName, []);
                roleMap.get(roleName)?.push(movieTitle);
            });

            // Convertir mapa a array de objetos
            const groupedRoles = Array.from(roleMap.entries()).map(([role, movies]) => ({
                role,
                movies
            }));

            // La lógica de cálculo de puntaje permanece basada en roles ÚNICOS
            const uniqueRoleNames = Array.from(roleMap.keys());
            const totalMovies = item.movies.length;

            const baseScore = uniqueRoleNames.length * 10;
            const sagaBonus = (totalMovies - uniqueRoleNames.length) * 2;
            const score = baseScore + sagaBonus;

            return {
                ...item,
                roles: groupedRoles,
                is_saga: uniqueRoleNames.length < totalMovies,
                score
            };
        }
        return { ...item, score: item.count }; // Default score = count
    });

    // Ordenar por score (descendente)
    sorted.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Limitar
    if (limit > 0) {
        sorted = sorted.slice(0, limit);
    }

    // Ordenar películas dentro de cada grupo por año
    sorted.forEach(item => {
        item.movies.sort((a, b) => a.year - b.year);
    });

    return sorted;
}

export async function getDashboardRankings(userId: string, options: RankingOptions = {}) {
    const supabase = await createClient();
    const { minRating = 8, limit = 5 } = options;

    // 1. Consulta única y eficiente para TODOS los elementos del watchlist con alta calificación
    const { data: watchlistItems, error } = await supabase
        .from('watchlists')
        .select(`
            user_rating,
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
        .gte('user_rating', minRating);

    if (error || !watchlistItems) {
        console.error('Error fetching dashboard rankings:', error);
        return {};
    }

    const reviews = watchlistItems.map(item => ({
        rating: item.user_rating,
        movies: item.movies
    }));

    if (error || !reviews) {
        console.error('Error fetching dashboard rankings:', error);
        return {};
    }

    // 2. Procesar en memoria reutilizando el conjunto de datos único
    // Helper para reutilizar la lógica de getRanking pero algo duplicada por velocidad (o refactorizar)
    // Para verificar la corrección sin refactorizar todo, podríamos simplemente llamar a la lógica para cada tipo
    // pasando el array "reviews" si refactorizamos getRanking para aceptar datos.
    // En su lugar, permitiré que getRanking acepte 'preFetchedReviews' opcionales.

    // En realidad, separar la lógica es más seguro por ahora.
    // Vamos a implementar una versión más ligera que agregue todo a la vez.

    const aggregates: Record<string, Record<string, RankingItem>> = {
        director: {},
        actor: {},
        genre: {},
        year: {},
        screenplay: {},
        photography: {},
        music: {}
    };

    reviews.forEach((review) => {
        const movie = review.movies;
        // @ts-ignore
        const m = Array.isArray(movie) ? movie[0] : movie;
        if (!m) return;

        const movieSimple = {
            id: m.id,
            title: m.title || 'Desconocido',
            year: m.year || 0,
            poster_url: m.poster_url,
            user_rating: review.rating || undefined
        };

        const ext = m.extended_data as any;

        // Helper para agregar item
        const addItem = (type: string, key: string, role?: string, photo?: string) => {
            if (!key) return;
            if (!aggregates[type][key]) {
                aggregates[type][key] = { name: key, count: 0, movies: [], roles: [], image_url: photo };
            }
            aggregates[type][key].count++;
            aggregates[type][key].movies.push(movieSimple);
            // @ts-ignore - Temporary structure, transformed in post-process
            if (role) aggregates[type][key].roles?.push({ name: role, movieTitle: movieSimple.title });
            if (!aggregates[type][key].image_url && photo) aggregates[type][key].image_url = photo;
        };

        const findImage = (name: string) => {
            const crew = ext?.crew_details?.find((c: any) => c.name === name);
            if (crew?.photo) return crew.photo;
            const cast = ext?.cast?.find((c: any) => c.name === name);
            if (cast?.photo) return cast.photo;
            return undefined;
        };

        // Directores
        if (m.director) m.director.split(',').forEach((d: string) => addItem('director', d.trim(), undefined, findImage(d.trim())));

        // Géneros
        if (Array.isArray(m.genres)) m.genres.forEach((g: any) => addItem('genre', String(g)));
        else if (ext?.technical?.genres) ext.technical.genres.forEach((g: any) => addItem('genre', g));

        // Año
        if (m.year) addItem('year', String(m.year));

        // Crew
        if (ext?.crew?.screenplay) addItem('screenplay', ext.crew.screenplay, undefined, findImage(ext.crew.screenplay));
        if (ext?.crew?.photography) addItem('photography', ext.crew.photography, undefined, findImage(ext.crew.photography));
        if (ext?.crew?.music) addItem('music', ext.crew.music, undefined, findImage(ext.crew.music));

        // Actores
        if (Array.isArray(ext?.cast)) {
            // Deduplicar actores por película
            const seenActors = new Set<string>();
            ext.cast.forEach((c: any) => {
                if (c.name && !seenActors.has(c.name)) {
                    addItem('actor', c.name, c.role, c.photo);
                    seenActors.add(c.name);
                }
            });
        }
    });

    // 3. Ordenar y Limitar todo
    const results: Record<string, RankingItem[]> = {};
    for (const type of Object.keys(aggregates)) {
        let sorted = Object.values(aggregates[type]);

        // Calcular scores
        const scored = sorted.map(item => {
            if (type === 'actor') {
                const allRoles = item.roles || [];
                // Agrupar roles por nombre
                const roleMap = new Map<string, string[]>();
                allRoles.forEach((r: any) => {
                    const roleName = r.name;
                    const movieTitle = r.movieTitle;
                    if (!roleMap.has(roleName)) roleMap.set(roleName, []);
                    roleMap.get(roleName)?.push(movieTitle);
                });

                const groupedRoles = Array.from(roleMap.entries()).map(([role, movies]) => ({
                    role,
                    movies
                }));

                const uniqueRoleNames = Array.from(roleMap.keys());
                const totalMovies = item.movies.length;

                const baseScore = uniqueRoleNames.length * 10;
                const sagaBonus = (totalMovies - uniqueRoleNames.length) * 2;

                return {
                    ...item,
                    roles: groupedRoles,
                    is_saga: uniqueRoleNames.length < totalMovies,
                    score: baseScore + sagaBonus
                };
            }
            return { ...item, score: item.count };
        });

        // Ordenar por score
        scored.sort((a, b) => (b.score || 0) - (a.score || 0));

        // Limitar
        if (limit > 0) {
            results[type] = scored.slice(0, limit);
        } else {
            results[type] = scored;
        }

        // Ordenar películas internas
        results[type].forEach(item => {
            item.movies.sort((a, b) => a.year - b.year);
        });
    }

    return results;
}
