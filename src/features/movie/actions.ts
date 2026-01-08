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
        recommendations?: Array<{
            id: number;
            title: string;
            year: number;
            poster: string | null;
            tmdb_id: number;
        }>;
    };
};

export async function getMovie(id: string): Promise<MovieDetail | null> {
    const supabase = await createClient();

    // Obtener usuario actual para buscar sus interacciones
    const { data: { user } } = await supabase.auth.getUser();

    // 0. DETECCIÓN INTELIGENTE DE ID
    // Si el ID es numérico, asumimos que es un TMDB ID y necesitamos buscarlo o importarlo.
    const isTmdbId = /^\d+$/.test(id);
    let movieId = id;

    if (isTmdbId) {
        // A. Buscar si ya existe en nuestra DB por alguna concordancia (usaremos IMDB ID idealmente)
        // Para eso, primero necesitamos detalles mínimos de TMDB para saber su IMDB ID
        try {
            const { tmdb } = await import('@/lib/tmdb');
            const tmdbMovie = await tmdb.getMovieDetails(parseInt(id));

            if (tmdbMovie) {
                // Intentar buscar en DB local por IMDB ID
                const { data: existing } = await supabase
                    .from('movies')
                    .select('id')
                    .eq('imdb_id', tmdbMovie.imdb_id)
                    .maybeSingle();

                // Mapear datos para inserción/actualización (SIEMPRE actualizamos para asegurar datos completos)
                const payload = {
                    title: tmdbMovie.title,
                    year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
                    imdb_id: tmdbMovie.imdb_id,
                    poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
                    director: tmdbMovie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || null,
                    synopsis: tmdbMovie.overview,
                    genres: tmdbMovie.genres?.map((g: any) => g.name) || [],
                    extended_data: {
                        technical: {
                            runtime: tmdbMovie.runtime,
                            tagline: tmdbMovie.tagline,
                        },
                        cast: tmdbMovie.credits?.cast?.slice(0, 10).map((c: any) => ({
                            name: c.name,
                            role: c.character,
                            photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                        })),
                        crew_details: tmdbMovie.credits?.crew?.slice(0, 5).map((c: any) => ({
                            name: c.name,
                            job: c.job,
                            photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                        })),
                        recommendations: tmdbMovie.recommendations?.results?.slice(0, 12).map((r: any) => ({
                            id: r.id, // TMDB ID
                            tmdb_id: r.id,
                            title: r.title,
                            year: r.release_date ? parseInt(r.release_date.split('-')[0]) : 0,
                            poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null
                        }))
                    }
                };

                if (existing) {
                    movieId = existing.id;
                    // ACTUALIZAR SIEMPRE para rellenar datos faltantes (como requests del usuario)
                    await supabase
                        .from('movies')
                        .update(payload)
                        .eq('id', movieId);
                } else {
                    // INSERTAR NUEVO
                    const { data: newEntry, error: insertError } = await supabase
                        .from('movies')
                        .insert(payload)
                        .select('id')
                        .single();

                    if (!insertError && newEntry) {
                        movieId = newEntry.id;
                    }
                }
            }
        } catch (e) {
            console.error('Error in on-demand import:', e);
            // Si falla importación, dejamos que falle la búsqueda normal de UUID
        }
    }

    // 1. Obtener datos básicos de la película
    const { data: movie, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId) // Usamos el ID resuelto (ya sea UUID original o el encontrado/creado)
        .single();

    if (error || !movie) {
        console.error('Error fetching movie:', error, 'ID tried:', movieId);
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
