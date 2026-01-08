'use server';

import { createClient } from '@/lib/supabase/server';

export type MovieDetail = {
    id: string;
    imdb_id: string | null;
    title: string;
    year: number;
    poster_url: string | null;
    director: string | null;
    genres: string[];
    synopsis: string | null;
    rating?: number; // Calificación del usuario si existe
    watchlist?: {
        status: string;
        added_at: string;
    } | null;
    extended_data: {
        technical?: {
            runtime?: number;
            certification?: string;
            tagline?: string;
            trailer_key?: string;
        };
        cast?: Array<{
            name: string;
            role: string;
            photo?: string;
        }>;
        crew?: {
            director?: string;
            screenplay?: string;
            photography?: string;
            music?: string;
        };
        crew_details?: Array<{
            name: string;
            job: string;
            photo?: string;
        }>;
    };
};

export async function getMovie(id: string): Promise<MovieDetail | null> {
    const supabase = await createClient();

    // Obtener usuario actual para buscar sus interacciones
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Obtener datos básicos de la película
    const { data: movie, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !movie) {
        console.error('Error fetching movie:', error);
        return null;
    }

    // 2. Obtener interacciones del usuario si está logueado
    let userReview = null;
    let userWatchlist = null;

    if (user) {
        const [reviewRes, watchlistRes] = await Promise.all([
            supabase
                .from('reviews')
                .select('rating')
                .eq('movie_id', id)
                .eq('user_id', user.id)
                .maybeSingle(),
            supabase
                .from('watchlists')
                .select('added_at')
                .eq('movie_id', id)
                .eq('user_id', user.id)
                .maybeSingle()
        ]);

        userReview = reviewRes.data;
        userWatchlist = watchlistRes.data;
    }

    // 3. Armar respuesta
    return {
        id: movie.id,
        imdb_id: movie.imdb_id,
        title: movie.title,
        year: movie.year,
        poster_url: movie.poster_url,
        director: movie.director,
        genres: movie.genres || [],
        synopsis: movie.synopsis,
        extended_data: movie.extended_data || {},
        rating: userReview?.rating,
        watchlist: userWatchlist ? {
            status: 'listed',
            added_at: userWatchlist.added_at!
        } : null
    };
}
