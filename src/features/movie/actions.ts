'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { syncMoviePeople } from '@/features/rankings/people-sync';

export type MovieDetail = {
    id: string;
    imdb_id: string | null;
    title: string;
    year: number;
    poster_url: string | null;
    director: string | null;
    genres: string[];
    synopsis: string | null;
    imdb_rating: number | null; // IMDb rating
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

    // Obtener usuario actual en paralelo (no bloquea el resto de la lógica inicial)
    const userPromise = supabase.auth.getUser();

    // 0. DETECCIÓN INTELIGENTE DE ID Y CACHE FIRST
    const isTmdbId = /^\d+$/.test(id);
    let movieId = id;

    if (isTmdbId) {
        // A. CACHE CHECK: Buscar primero en DB local por tmdb_id
        const { data: localMovie } = await supabase
            .from('movies')
            .select('id')
            .eq('tmdb_id', parseInt(id))
            .maybeSingle();

        if (localMovie) {
            // HIT! Usamos el ID local y saltamos fetch a TMDB (ahorramos ~300ms)
            // console.log(`[Cache Hit] Movie ${id} found in DB as ${localMovie.id}`);
            movieId = localMovie.id;
        } else {
            // MISS! Fetch TMDB + Upsert
            try {
                const { tmdb } = await import('@/lib/tmdb');
                const tmdbMovie = await tmdb.getMovieDetails(parseInt(id));

                if (tmdbMovie) {

                    // Recomendaciones On-Demand:
                    // Si la API de detalles no devolvió recomendaciones, intentamos obtenerlas explícitamente.
                    let validRecommendations = tmdbMovie.recommendations?.results || [];
                    if (validRecommendations.length === 0) {
                        try {
                            validRecommendations = await tmdb.getRecommendations(tmdbMovie.id);
                        } catch (e) {
                            console.error('Error fetching on-demand recommendations:', e);
                        }
                    }

                    // Intentar buscar en DB local por IMDB ID (Double Check por si acaso)
                    const { data: existing } = await supabase
                        .from('movies')
                        .select('id, extended_data')
                        .eq('imdb_id', tmdbMovie.imdb_id)
                        .maybeSingle();

                    const payload = {
                        title: tmdbMovie.title,
                        year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
                        imdb_id: tmdbMovie.imdb_id,
                        tmdb_id: tmdbMovie.id, // Ensure we save TMDB ID!
                        poster_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
                        director: tmdbMovie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || null,
                        synopsis: tmdbMovie.overview,
                        imdb_rating: tmdbMovie.vote_average,
                        genres: tmdbMovie.genres?.map((g: any) => g.name) || [],
                        extended_data: {
                            technical: {
                                runtime: tmdbMovie.runtime,
                                tagline: tmdbMovie.tagline,
                            },
                            cast: tmdbMovie.credits?.cast?.slice(0, 50).map((c: any) => ({
                                name: c.name,
                                role: c.character,
                                photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                            })),
                            crew_details: tmdbMovie.credits?.crew?.slice(0, 20).map((c: any) => ({
                                name: c.name,
                                job: c.job,
                                photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                            })),
                            recommendations: validRecommendations.slice(0, 12).map((r: any) => ({
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
                        // Solo actualizar si realmente falta algo importante para evitar writes
                        // Si no tenía tmdb_id guardado, actualizarlo
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

                    // Sync People POST-UPSERT:
                    // Ahora que tenemos un movieId válido (UUID) de nuestra DB,
                    // podemos sincronizar los actores y relaciones.
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

    // SAFETY CHECK: Validar UUID
    // Si entró un ID numérico (TMDB) y no logramos resolverlo a un UUID (falló upsert o no existe),
    // NO intentamos consultar la DB porque fallará con "invalid input syntax for type uuid".
    if (isTmdbId && movieId === id) {
        // console.warn(`[getMovie] Could not resolve TMDB ID ${id} to a valid UUID. Returning null.`);
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
            // console.log(`[Action] Repairing/Enriching movie ${movie.title} (${movie.id})`);
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
                    director: tmdbMovie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || null,
                    synopsis: tmdbMovie.overview,
                    imdb_rating: tmdbMovie.vote_average,
                    genres: tmdbMovie.genres?.map((g: any) => g.name) || [],
                    extended_data: {
                        technical: {
                            runtime: tmdbMovie.runtime,
                            tagline: tmdbMovie.tagline,
                        },
                        cast: tmdbMovie.credits?.cast?.slice(0, 50).map((c: any) => ({
                            name: c.name,
                            role: c.character,
                            photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                        })),
                        crew_details: tmdbMovie.credits?.crew?.slice(0, 20).map((c: any) => ({
                            name: c.name,
                            job: c.job,
                            photo: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
                        })),
                        recommendations: validRecommendations.slice(0, 12).map((r: any) => ({
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
        imdb_rating: movie.imdb_rating || null, // Pass IMDb rating
        extended_data: movie.extended_data || {},
        rating: userReview?.rating,
        watchlist: userWatchlist ? {
            status: 'listed',
            added_at: userWatchlist.added_at!
        } : null
    };
}
