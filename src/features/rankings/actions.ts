'use server';

import { createClient } from '@/lib/supabase/server';

export type RankingType = 'director' | 'actor' | 'genre' | 'year' | 'screenplay' | 'photography' | 'music';

export type RankingStatConfig = {
    type: RankingType;
    key: string;
    count: number;
    score: number;
    data: {
        image_url?: string;
        movies: RankingMovie[];
        roles?: { role: string; movies: string[] }[];
    };
};

// Tipos para respuestas RPC
type RankingMovie = {
    id: string;
    title: string;
    year: number;
    poster_url: string | null;
    user_rating?: number;
    imdb_rating?: number;
    director_name?: string;
};

type PersonRankingRpcRow = {
    name: string;
    photo_url: string | null;
    total_movies: number;
    score: number;
    top_movies: RankingMovie[];
};

export async function getRanking(
    userId: string,
    type: RankingType,
    options: { minRating?: number; limit?: number } = {}
): Promise<RankingStatConfig[]> {
    const supabase = await createClient();
    const limit = options.limit || 20;

    // Mapear tipo del frontend a rol de DB (para categorías de personas)
    let role: string | null = null;
    switch (type) {
        case 'director': role = 'Director'; break;
        case 'actor': role = 'Actor'; break;
        case 'screenplay': role = 'Writer'; break; // Mapea a 'Screenplay' o 'Writer' en RPC
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
            p_limit: limit,
            p_min_rating: options.minRating || 0
        });

        if (error) {
            console.error(`Error fetching rankings for ${type}:`, error);
            throw new Error(`Failed to fetch rankings for ${type}`);
        }

        if (!data) return [];

        // Mapeamos la respuesta del RPC a la estructura del frontend
        return (data as PersonRankingRpcRow[]).map((item) => {
            // Deduplicar películas usando un Map por ID
            const moviesMap = new Map();

            (item.top_movies || []).forEach((m: any) => {
                if (!moviesMap.has(m.id)) {
                    moviesMap.set(m.id, {
                        id: m.id,
                        title: m.title,
                        year: m.year,
                        poster_url: m.poster_url,
                        user_rating: m.user_rating,
                        imdb_rating: m.imdb_rating,
                        director_name: m.director_name
                    });
                }
            });

            const movies = Array.from(moviesMap.values())
                .filter((m: any) => m.user_rating && m.user_rating > 0);

            const count = Number(item.total_movies) || 0;
            const score = Number(item.score) || 0;

            return {
                type,
                key: item.name,
                count,
                score,
                data: {
                    image_url: item.photo_url ?? undefined,
                    movies
                }
            };
        })
            .filter((item) => item.data.movies.length > 0)
            .sort((a, b) => b.score - a.score);
    }

    // 2. Rankings por Género (vía RPC)
    if (type === 'genre') {
        const { data, error } = await supabase.rpc('get_genre_rankings', {
            p_user_id: userId,
            p_limit: limit,
            p_min_rating: options.minRating || 0
        });

        if (error) {
            console.error('Error fetching genre rankings:', error);
            throw new Error('Failed to fetch genre rankings');
        }

        if (!data) return [];

        return data.map((item: { genre: string; total_movies: number; average_rating: number; score: number; top_movies: unknown[] }) => ({
            type: 'genre' as RankingType,
            key: item.genre,
            count: Number(item.total_movies),
            score: Number(item.score),
            data: {
                movies: (item.top_movies || []).map((m: unknown) => {
                    const movie = m as { id: string; title: string; year: number; poster_url: string | null; user_rating: number; imdb_rating?: number };
                    return {
                        id: movie.id,
                        title: movie.title,
                        year: movie.year,
                        poster_url: movie.poster_url,
                        user_rating: movie.user_rating,
                        imdb_rating: movie.imdb_rating
                    };
                })
            }
        }));
    }

    // 3. Rankings por Año (vía RPC)
    if (type === 'year') {
        const { data, error } = await supabase.rpc('get_year_rankings', {
            p_user_id: userId,
            p_limit: limit,
            p_min_rating: options.minRating || 0
        });

        if (error) {
            console.error('Error fetching year rankings:', error);
            throw new Error('Failed to fetch year rankings');
        }

        if (!data) return [];

        return data.map((item: { year: number; total_movies: number; average_rating: number; score: number; top_movies: unknown[] }) => ({
            type: 'year' as RankingType,
            key: String(item.year),
            count: Number(item.total_movies),
            score: Number(item.score),
            data: {
                movies: (item.top_movies || []).map((m: unknown) => {
                    const movie = m as { id: string; title: string; year: number; poster_url: string | null; user_rating: number; imdb_rating?: number };
                    return {
                        id: movie.id,
                        title: movie.title,
                        year: movie.year,
                        poster_url: movie.poster_url,
                        user_rating: movie.user_rating,
                        imdb_rating: movie.imdb_rating
                    };
                })
            }
        }));
    }

    return [];
}
