'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type RankingType = 'director' | 'actor' | 'genre' | 'year' | 'screenplay' | 'photography' | 'music';

export type RankingStatConfig = {
    type: RankingType;
    key: string;
    count: number;
    score: number;
    data: {
        image_url?: string;
        movies: {
            id: string;
            title: string;
            year: number;
            poster_url: string | null;
            user_rating?: number;
        }[];
        roles?: { role: string; movies: string[] }[]; // Keeping for compatibility, though RPC handles roles implicitly
    };
};

export async function getRanking(
    userId: string,
    type: RankingType,
    options: { minRating?: number; limit?: number } = {}
): Promise<RankingStatConfig[]> {
    const supabase = await createClient();
    const limit = options.limit || 20;

    // Map frontend type to DB role (for person categories)
    let role: string | null = null;
    switch (type) {
        case 'director': role = 'Director'; break;
        case 'actor': role = 'Actor'; break;
        case 'screenplay': role = 'Writer'; break; // Maps to 'Screenplay' or 'Writer' in RPC
        case 'photography': role = 'Director of Photography'; break;
        case 'music': role = 'Original Music Composer'; break;
    }

    // 1. Rankings de Personas (vía RPC)
    // Utilizamos una función RPC de Postgres `get_person_rankings` para un cálculo eficiente y rápido.
    // Esto reemplaza la lógica anterior que procesaba datos en memoria (lenta y costosa).
    if (role) {
        const { data, error } = await supabase.rpc('get_person_rankings', {
            p_user_id: userId,
            p_role: role,
            p_limit: limit
        });

        if (error) {
            console.error(`Error fetching rankings for ${type}:`, error);
            throw new Error(`Failed to fetch rankings for ${type}`);
        }

        if (!data) return [];

        // Mapeamos la respuesta optimizada del RPC a la estructura visual del frontend.
        // Mapeamos la respuesta optimizada del RPC a la estructura visual del frontend.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((item: any) => {
            const movies = (item.top_movies as any[] || [])
                .map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    year: m.year,
                    poster_url: m.poster_url,
                    user_rating: m.user_rating
                }))
                .filter((m) => m.user_rating && m.user_rating > 0);

            const count = movies.length;
            const avgRating = count > 0
                ? movies.reduce((acc, m) => acc + (m.user_rating || 0), 0) / count
                : 0;

            return {
                type,
                key: item.name,
                count: count,
                score: (count * 10) + (avgRating * 2),
                data: {
                    image_url: item.photo_url,
                    movies: movies
                }
            };
        })
            .filter((item: any) => item.data.movies.length > 0)
            .sort((a: any, b: any) => b.score - a.score);
    }

    // 2. Rankings por Género y Año (Agregación en Memoria Optimizada)
    // Nota: Ya no traemos `extended_data` completo (que es muy pesado).
    // Traemos solo las columnas estrictamente necesarias y realizamos la agregación en memoria,
    // lo cual ahora es suficientemente rápido.
    // TODO: En el futuro, si el catálogo crece exponencialmente, considerar migrar a RPC.

    // GÉNERO
    if (type === 'genre') {
        // Dado que los géneros están en `movies.genres` (JSON), necesitamos extraerlos.
        // Consultamos solo los datos necesarios de la tabla `watchlists` unida a `movies`.

        const { data: movies, error } = await supabase
            .from('watchlists')
            .select(`
                user_rating,
                movies!inner (
                    id, title, year, poster_url, genres
                )
            `)
            .eq('user_id', userId)
            .gte('user_rating', 1);

        if (error || !movies) return [];

        // Agregación en memoria (Rápida gracias a la reducción de datos consultados)
        const genreCounts: Record<string, RankingStatConfig> = {};


        for (const item of movies) {
            const mData = item.movies;
            const m = Array.isArray(mData) ? mData[0] : mData;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!m || !(m as any).genres) continue;

            // Aseguramos que genres sea un array, casteando si es necesario desde JSON.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const genresReq = Array.isArray((m as any).genres) ? (m as any).genres : [];

            for (const g of genresReq) {
                const gName = String(g);
                if (!genreCounts[gName]) {
                    genreCounts[gName] = {
                        type: 'genre',
                        key: gName,
                        count: 0,
                        score: 0,
                        data: { movies: [] }
                    };
                }
                const stat = genreCounts[gName];
                stat.count++;
                stat.score += 10;
                stat.data.movies.push({
                    id: m.id,
                    title: m.title,
                    year: m.year,
                    poster_url: m.poster_url,
                    user_rating: item.user_rating || 0
                });
            }
        }

        return Object.values(genreCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    // YEAR
    if (type === 'year') {
        const { data: movies, error } = await supabase
            .from('watchlists')
            .select(`
                user_rating,
                movies!inner (
                    id, title, year, poster_url
                )
            `)
            .eq('user_id', userId)
            .gte('user_rating', 1);

        if (error || !movies) return [];

        const yearCounts: Record<string, RankingStatConfig> = {};


        for (const item of movies) {
            const mData = item.movies;
            const m = Array.isArray(mData) ? mData[0] : mData;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!m || !(m as any).year) continue;

            const y = String((m as any).year);
            if (!yearCounts[y]) {
                yearCounts[y] = {
                    type: 'year',
                    key: y,
                    count: 0,
                    score: 0,
                    data: { movies: [] }
                };
            }
            const stat = yearCounts[y];
            stat.count++;
            stat.score += 10;
            stat.data.movies.push({
                id: m.id,
                title: m.title,
                year: m.year,
                poster_url: m.poster_url,
                user_rating: item.user_rating || 0
            });
        }

        return Object.values(yearCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    return [];
}
