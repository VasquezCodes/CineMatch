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
    userId: string,
    type: RankingType,
    options: RankingOptions = {}
): Promise<RankingItem[]> {
    const supabase = await createClient();
    const { limit = 10 } = options;

    // LEER DE MATERIALIZED STATS
    const { data: stats, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('score', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching stats:', error);
        return [];
    }

    if (!stats || stats.length === 0) {
        // Fallback: Si no hay stats (primera vez), devolver vacío? 
        // O disparar cálculo? Mejor devolver vacío y dejar que el worker corra en background eventualmente.
        return [];
    }

    // Map DB Row to RankingItem
    return stats.map(s => ({
        name: s.key,
        count: s.count,
        score: s.score,
        movies: [], // No cargamos películas aquí para listado ligero, o las sacamos del JSONB 'data'
        image_url: s.data?.image_url,
        roles: s.data?.roles || [],
        is_saga: false // Se podría derivar de data
    }));
}

export async function getDashboardRankings(userId: string, options: RankingOptions = {}) {
    const supabase = await createClient();
    const { limit = 5 } = options;

    const types = ['director', 'actor', 'genre', 'year', 'screenplay', 'photography', 'music'];
    const results: Record<string, RankingItem[]> = {};

    // Parallel Fetch for all types from Materialized View (Fast!)
    await Promise.all(types.map(async (type) => {
        const { data } = await supabase
            .from('user_statistics')
            .select('*')
            .eq('user_id', userId)
            .eq('type', type)
            .order('score', { ascending: false })
            .limit(limit);

        if (data) {
            results[type] = data.map(s => ({
                name: s.key,
                count: s.count,
                score: s.score,
                movies: [],
                image_url: s.data?.image_url,
                roles: s.data?.roles || [],
                is_saga: false
            }));
        } else {
            results[type] = [];
        }
    }));

    return results;
}
