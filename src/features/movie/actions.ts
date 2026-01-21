'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { syncMoviePeople } from '@/features/rankings/people-sync';
import { TmdbClient } from '@/lib/tmdb';

// Tipos auxiliares para mappings de TMDB
type TmdbCrew = { id: number; name: string; job: string; profile_path: string | null };
type TmdbCast = { id: number; name: string; character: string; profile_path: string | null };
type TmdbGenre = { id: number; name: string };
type TmdbRecommendation = { id: number; title: string; poster_path: string | null; release_date: string };
export type MovieDetail = {
    id: string;
    imdb_id: string | null;
    title: string;
    year: number;
    poster_url: string | null;
    backdrop_url: string | null;
    director: string | null;
    genres: string[];
    synopsis: string | null;
    imdb_rating: number | null; // Calificación IMDb
    rating?: number; // Calificación del usuario si existe
    personalRating?: number; // Puntaje personal del ranking (watchlists.user_rating)
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

    // Obtener usuario actual en paralelo (no bloquea el resto de la lógica inicial)
    const userPromise = supabase.auth.getUser();

    // Detectar tipo de ID y buscar en cache primero
    const isTmdbId = /^\d+$/.test(id);
    let movieId = id;

    if (isTmdbId) {
        // Buscar en DB local por tmdb_id
        const { data: localMovie } = await supabase
            .from('movies')
            .select('id')
            .eq('tmdb_id', parseInt(id))
            .maybeSingle();

        if (localMovie) {
            movieId = localMovie.id;
        } else {
            // Cache MISS - fetch desde TMDB
            try {
                const { tmdb } = await import('@/lib/tmdb');
                const tmdbMovie = await tmdb.getMovieDetails(parseInt(id));

                if (tmdbMovie) {

                    // Si no hay recomendaciones, obtenerlas explícitamente
                    let validRecommendations = tmdbMovie.recommendations?.results || [];
                    if (validRecommendations.length === 0) {
                        try {
                            validRecommendations = await tmdb.getRecommendations(tmdbMovie.id);
                        } catch (e) {
                            console.error('Error fetching on-demand recommendations:', e);
                        }
                    }

                    // Verificar si ya existe por IMDB ID
                    const { data: existing } = await supabase
                        .from('movies')
                        .select('id, extended_data')
                        .eq('imdb_id', tmdbMovie.imdb_id)
                        .maybeSingle();

                    const payload = {
                        title: tmdbMovie.title,
                        year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
                        imdb_id: tmdbMovie.imdb_id,
                        tmdb_id: tmdbMovie.id, // Asegurar que guardamos el TMDB ID
                        poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
                        backdrop_url: TmdbClient.getBestBackdropUrl(tmdbMovie.images, tmdbMovie.backdrop_path),
                        director: tmdbMovie.credits?.crew?.find((c: TmdbCrew) => c.job === 'Director')?.name || null,
                        synopsis: tmdbMovie.overview,
                        imdb_rating: tmdbMovie.vote_average,
                        genres: tmdbMovie.genres?.map((g: TmdbGenre) => g.name) || [],
                        extended_data: {
                            technical: {
                                runtime: tmdbMovie.runtime,
                                tagline: tmdbMovie.tagline,
                            },
                            cast: tmdbMovie.credits?.cast?.slice(0, 50).map((c: TmdbCast) => ({
                                name: c.name,
                                role: c.character,
                                photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                            })),
                            crew_details: tmdbMovie.credits?.crew?.slice(0, 20).map((c: TmdbCrew) => ({
                                name: c.name,
                                job: c.job,
                                photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                            })),
                            recommendations: validRecommendations.slice(0, 12).map((r: TmdbRecommendation) => ({
                                id: r.id,
                                tmdb_id: r.id,
                                title: r.title,
                                year: r.release_date ? parseInt(r.release_date.split('-')[0]) : 0,
                                poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null
                            }))
                        }
                    };

                    if (existing) {
                        movieId = existing.id;
                        // Actualizar si falta tmdb_id
                        await supabase.from('movies').update({ ...payload, tmdb_id: tmdbMovie.id }).eq('id', movieId);
                    } else {
                        const { data: newEntry, error: insertError } = await supabase
                            .from('movies')
                            .insert(payload)
                            .select('id')
                            .single();

                        if (!insertError && newEntry) {
                            movieId = newEntry.id;
                        }
                    }

                    // Sincronizar actores y crew con la DB
                    if (tmdbMovie.credits && movieId && movieId !== id) {
                        const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
                            auth: { persistSession: false }
                        });
                        await syncMoviePeople(adminClient, movieId, tmdbMovie.credits);
                    }
                }
            } catch (e) {
                console.error('Error in on-demand import:', e);
            }
        }
    }


    // 1. Obtener datos básicos de la película (ahora en paralelo con la autenticación)

    if (isTmdbId && movieId === id) {
        return null;
    }

    // Ejecutamos ambas promesas y esperamos
    const [userResult, movieResult] = await Promise.all([
        userPromise,
        supabase.from('movies').select('*').eq('id', movieId).single()
    ]);

    const user = userResult.data.user;
    const { data: movie, error } = movieResult;

    if (error || !movie) {
        console.error('Error fetching movie:', error, 'ID tried:', movieId);
        return null;
    }


    // 1.5 ENRIQUECIMIENTO ON-DEMAND (Full Repair & UUID Lookup)
    // Verificamos si la película está incompleta (falta sinopsis, cast o recomendaciones)
    const extended = movie.extended_data as any || {};
    const hasRecommendations = extended.recommendations && extended.recommendations.length > 0;
    const isIncomplete = !movie.synopsis || !extended.cast || extended.cast.length === 0 || !hasRecommendations;

    if (isIncomplete && (movie.tmdb_id || movie.imdb_id)) {
        try {
            const { tmdb } = await import('@/lib/tmdb');
            let tmdbMovie = null;

            if (movie.tmdb_id) {
                tmdbMovie = await tmdb.getMovieDetails(movie.tmdb_id);
            } else if (movie.imdb_id) {
                tmdbMovie = await tmdb.findByImdbId(movie.imdb_id);
            }

            if (tmdbMovie) {
                // Recommendations Fallback
                let validRecommendations = tmdbMovie.recommendations?.results || [];
                if (validRecommendations.length === 0) {
                    try {
                        validRecommendations = await tmdb.getRecommendations(tmdbMovie.id);
                    } catch (e) {
                        console.error('Error fetching on-demand recommendations:', e);
                    }
                }

                const payload = {
                    title: tmdbMovie.title,
                    year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
                    imdb_id: tmdbMovie.imdb_id,
                    tmdb_id: tmdbMovie.id,
                    poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
                    backdrop_url: TmdbClient.getBestBackdropUrl(tmdbMovie.images, tmdbMovie.backdrop_path),
                    director: tmdbMovie.credits?.crew?.find((c: TmdbCrew) => c.job === 'Director')?.name || null,
                    synopsis: tmdbMovie.overview,
                    imdb_rating: tmdbMovie.vote_average,
                    genres: tmdbMovie.genres?.map((g: TmdbGenre) => g.name) || [],
                    extended_data: {
                        technical: {
                            runtime: tmdbMovie.runtime,
                            tagline: tmdbMovie.tagline,
                        },
                        cast: tmdbMovie.credits?.cast?.slice(0, 50).map((c: TmdbCast) => ({
                            name: c.name,
                            role: c.character,
                            photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                        })),
                        crew_details: tmdbMovie.credits?.crew?.slice(0, 20).map((c: TmdbCrew) => ({
                            name: c.name,
                            job: c.job,
                            photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                        })),
                        recommendations: validRecommendations.slice(0, 12).map((r: TmdbRecommendation) => ({
                            id: r.id,
                            tmdb_id: r.id,
                            title: r.title,
                            year: r.release_date ? parseInt(r.release_date.split('-')[0]) : 0,
                            poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null
                        }))
                    }
                };

                // Actualizar DB
                await supabase.from('movies').update(payload).eq('id', movie.id);

                // Actualizar objeto en memoria para esta request
                Object.assign(movie, payload);

                // Sync People con el adminClient (para relaciones)
                if (tmdbMovie.credits) {
                    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
                        auth: { persistSession: false }
                    });
                    await syncMoviePeople(adminClient, movie.id, tmdbMovie.credits);
                }
            }
        } catch (e) {
            console.error('Error repairing movie data:', e);
        }
    }

    // 2. Obtener interacciones del usuario si está logueado
    let userWatchlist = null;

    if (user) {
        const { data } = await supabase
            .from('watchlists')
            .select('updated_at, user_rating')
            .eq('movie_id', movieId)
            .eq('user_id', user.id)
            .maybeSingle();

        userWatchlist = data;
    }

    // 3. Armar respuesta
    return {
        id: movie.id,
        imdb_id: movie.imdb_id,
        title: movie.title,
        year: movie.year,
        poster_url: movie.poster_url,
        backdrop_url: movie.backdrop_url,
        director: movie.director,
        genres: movie.genres || [],
        synopsis: movie.synopsis,
        imdb_rating: movie.imdb_rating || null,
        extended_data: movie.extended_data || {},
        rating: userWatchlist?.user_rating,
        personalRating: userWatchlist?.user_rating,
        watchlist: userWatchlist ? {
            status: 'listed',
            added_at: userWatchlist.updated_at!
        } : null
    };
}
