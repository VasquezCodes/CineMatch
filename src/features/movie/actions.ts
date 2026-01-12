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
                    // Sync People:
                    // Sincronización "On-Demand": Si la película es nueva o se está recargando,
                    // aseguramos que los actores y equipo técnico se registren en la tabla relacional `movie_people`.
                    // Usamos adminClient para evitar restricciones de RLS durante escrituras del sistema.
                    const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
                        auth: { persistSession: false }
                    });
                    if (tmdbMovie.credits) {
                        await syncMoviePeople(adminClient, movieId, tmdbMovie.credits);
                    }

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
                        const hasRecommendations = existing.extended_data &&
                            (existing.extended_data as any).recommendations &&
                            (existing.extended_data as any).recommendations.length > 0;

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
                }
            } catch (e) {
                console.error('Error in on-demand import:', e);
            }
        }
    }

    // 1. Obtener datos básicos de la película (ahora en paralelo con la autenticación)
    // const moviePromise = supabase
    //     .from('movies')
    //     .select('*')
    //     .eq('id', movieId)
    //     .single();

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

    // 1.5 ENRIQUECIMIENTO ON-DEMAND (UUID Lookup)
    // Si recuperamos la película de la DB (por UUID) pero le faltan recomendaciones (e.g. importada hace mucho o incompleta),
    // intentamos buscarlas en TMDB y actualizar.
    const extended = movie.extended_data as any || {};
    const hasRecommendations = extended.recommendations && extended.recommendations.length > 0;

    if (!hasRecommendations && movie.imdb_id) {
        try {
            // console.log(`[Action] Enriching recommendations for ${movie.title} (${movie.id})`);
            const { tmdb } = await import('@/lib/tmdb');
            // Necesitamos TMDB ID. Si no lo tenemos guardado, lo buscamos por IMDB ID.
            const tmdbMovie = await tmdb.findByImdbId(movie.imdb_id);

            if (tmdbMovie) {
                // Sync people using admin client
                const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
                    auth: { persistSession: false }
                });
                if (tmdbMovie.credits) {
                    await syncMoviePeople(adminClient, movie.id, tmdbMovie.credits);
                }

                const recommendations = tmdbMovie.recommendations?.results || [];
                if (recommendations.length > 0) {
                    const validRecommendations = recommendations.slice(0, 12).map((r: any) => ({
                        id: r.id, // TMDB ID
                        tmdb_id: r.id,
                        title: r.title,
                        year: r.release_date ? parseInt(r.release_date.split('-')[0]) : 0,
                        poster: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null
                    }));

                    // Actualizar DB
                    const newExtended = { ...extended, recommendations: validRecommendations };
                    await supabase
                        .from('movies')
                        .update({ extended_data: newExtended })
                        .eq('id', movie.id);

                    // Actualizar objeto en memoria para esta request
                    movie.extended_data = newExtended;
                }
            }
        } catch (e) {
            console.error('Error enriching movie recommendations:', e);
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
