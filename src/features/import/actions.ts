'use server';

import { createClient } from '@/lib/supabase/server';
import { tmdb, TmdbClient } from '@/lib/tmdb';
import { revalidatePath } from 'next/cache';

export type CsvMovieImport = {
    imdb_id: string; // Const
    title: string;
    year: number;
    user_rating?: number; // Your Rating
    date_rated?: string; // Date Rated
    genres?: string;
    url?: string;
    imdb_rating?: number; // IMDb Rating
    runtime_mins?: number; // Runtime (mins)
    release_date?: string; // Release Date
    directors?: string; // Directors
    num_votes?: number; // Num Votes
    position?: number; // Order in list
};

type ImportResult = {
    success: boolean;
    total: number;
    new_movies: number;
    updated_movies: number;
    errors: number;
};

export async function processImport(movies: CsvMovieImport[]): Promise<ImportResult> {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();

    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    // Obtener username del perfil para guardar en reviews
    const { data: profile } = await (await supabase).from('profiles').select('username').eq('id', user.id).single();
    const userName = profile?.username || user.email;

    let newCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    // Procesar por lotes para evitar tiempos de espera (timeouts)
    const BATCH_SIZE = 10;

    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (movie) => {
            try {
                // 1. Insertar o Actualizar Película (Info Básica)
                const { data: savedMovie, error: movieError } = await (await supabase).from('movies').upsert({
                    imdb_id: movie.imdb_id,
                    title: movie.title,
                    year: movie.year,
                    // Usar datos del CSV como base inicial
                    director: movie.directors,
                    genres: movie.genres ? movie.genres.split(',').map(g => g.trim()) : [], // CSV genres string to JSON array
                    imdb_rating: movie.imdb_rating,
                    // Inicializar extended_data con datos del CSV si es posible
                    extended_data: {
                        technical: {
                            runtime: movie.runtime_mins,
                            // Otros campos se llenarán con enrichment
                        }
                    }
                }, { onConflict: 'imdb_id' }).select('id, extended_data, poster_url').single();

                if (movieError || !savedMovie) {
                    console.error(`Error saving movie ${movie.title}:`, movieError);
                    errorCount++;
                    return;
                }

                if (!savedMovie) {
                    errorCount++;
                    return;
                }

                // Verificar si falta enriquecimiento (usamos poster_url como proxy de "datos completos")
                // O si extended_data existe pero solo tiene la info técnica básica del CSV
                const hasFullData = savedMovie.poster_url && savedMovie.extended_data && (savedMovie.extended_data as any).cast;

                if (!hasFullData) {
                    newCount++;
                    // Enriquecer en el mismo ciclo para asegurar que se guarden los datos
                    // (Aunque sea más lento, garantiza completitud en Server Actions)
                    await enrichMovieData(savedMovie.id, movie.imdb_id);
                } else {
                    updatedCount++;
                }

                // 2. Insertar Reseña si existe calificación
                if (movie.user_rating) {
                    const { error: reviewError } = await (await supabase).from('reviews').upsert({
                        user_id: user.id,
                        movie_id: savedMovie.id,
                        rating: movie.user_rating,
                        created_at: movie.date_rated ? new Date(movie.date_rated).toISOString() : new Date().toISOString(),
                        // Guardar nombres para fácil lectura en dashboard/admin
                        user_name: userName,
                        movie_name: movie.title
                    }, { onConflict: 'user_id, movie_id' });

                    if (reviewError) {
                        console.error(`Error saving review for ${movie.title}:`, reviewError);
                    }
                    // Nota: 'reviews' podría no tener constraint de user_id+movie_id aún.
                    // Si no, esto actúa como Insert. Asumimos una reseña por peli por usuario.
                }

                // 3. Insertar en Watchlist (siempre, para guardar la posición)
                if (movie.position) {
                    await (await supabase).from('watchlists').upsert({
                        user_id: user.id,
                        movie_id: savedMovie.id,
                        position: movie.position,
                        status: movie.user_rating ? 'watched' : 'plan_to_watch', // Inferir estado
                        updated_at: new Date().toISOString(),
                        user_name: userName,
                        movie_title: movie.title,
                        user_rating: movie.user_rating
                    }, { onConflict: 'user_id, movie_id' as any }); // Cast genérico si TS se queja por columnas compuestas en types generados
                }

            } catch (e) {
                console.error("Import error:", e);
                errorCount++;
            }
        }));
    }

    revalidatePath('/app/library');

    return {
        success: true,
        total: movies.length,
        new_movies: newCount,
        updated_movies: updatedCount,
        errors: errorCount
    };
}

// Background enrichment logic
async function enrichMovieData(movieId: string, imdbId: string) {
    try {
        console.log(`Enriching movie ${imdbId}...`);
        const details = await tmdb.findByImdbId(imdbId);

        if (details) {
            const supabase = createClient();

            // Extraer certificación (rating MPAA) - Priorizamos US por estándar
            const certification = details.release_dates?.results?.find(r => r.iso_3166_1 === 'US')?.release_dates[0]?.certification;

            // Extraer Trailer (YouTube)
            const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key;

            // Map TMDb details to our JSON structure
            const extendedData = {
                cast: details.credits.cast.slice(0, 50).map(c => ({
                    name: c.name,
                    role: c.character,
                    photo: TmdbClient.getImageUrl(c.profile_path, 'w185') // Foto pequeña para cast
                })),
                crew: {
                    director: details.credits.crew.filter(c => c.job === 'Director').map(c => c.name).join(', '),
                    screenplay: details.credits.crew.find(c => c.job === 'Screenplay' || c.job === 'Writer')?.name,
                    photography: details.credits.crew.find(c => c.job === 'Director of Photography')?.name,
                    music: details.credits.crew.find(c => c.job === 'Original Music Composer')?.name
                },
                technical: {
                    runtime: details.runtime,
                    budget: details.budget,
                    revenue: details.revenue,
                    vote_average: details.vote_average,
                    vote_count: details.vote_count,
                    genres: details.genres.map(g => g.name),
                    overview: details.overview,
                    certification: certification,
                    trailer_key: trailer,
                    tagline: details.tagline
                }
            };

            await (await supabase).from('movies').update({
                extended_data: extendedData,
                poster_url: TmdbClient.getImageUrl(details.poster_path, 'w500'),
                synopsis: details.overview,
                // Actualizar campos básicos si faltaban
                director: extendedData.crew.director,
                genres: extendedData.technical.genres,
                // Si ya tenemos imdb_rating del CSV, no lo sobreescribimos con TMDb, mejor lo guardamos en extended
                // O podríamos tener una lógica de "si es nulo, usa TMDb"
                // Por ahora, asumimos que imdb_rating es el "public score". Si vino nulo del CSV, intentamos llenar.
                // Pero como es un update, solo actualizamos si queremos forzar. 
                // Mejor estrategia: TMDb rating va a extended data (vote_average), y dejamos imdb_rating para IMDb.
            }).eq('id', movieId);

            console.log(`Enriched ${imdbId} successfully.`);
        }
    } catch (error) {
        console.error(`Failed to enrich movie ${imdbId}`, error);
    }
}
