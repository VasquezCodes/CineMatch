import { createClient } from '@supabase/supabase-js';
import { tmdb, TmdbClient } from '@/lib/tmdb';
import { NextRequest, NextResponse } from 'next/server';
import { syncMoviePeople } from '@/features/rankings/people-sync'; // Lógica compartida para sincronizar People

// Tiempo máximo de ejecución por lote (limitado por Vercel)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    try {
        // 1. Verificar seguridad
        const authHeader = request.headers.get('x-cron-secret');
        if (authHeader !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseServiceKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        let keepProcessing = true;
        let totalProcessed = 0;
        let totalSuccess = 0;
        let totalFailed = 0;

        const userIdsEncountered = new Set<string>();

        // Loop de procesamiento: Se mantiene vivo mientras tenga tiempo (< 50s)
        while (keepProcessing) {
            const elapsedTime = Date.now() - startTime;
            // Si pasaron más de 50 segundos, paramos para permitir el trigger recursivo seguro.
            // Esto evita que Vercel termine la ejecución abruptamente.
            if (elapsedTime > 50000) {
                console.log(`Time limit reached (${elapsedTime}ms). Stopping loop.`);
                break;
            }

            // 2. Obtener items pendientes (lotes pequeños para feedback rápido)
            // Obtenemos una pequeña cantidad (10) para evitar timeouts y dar feedback visual rápido al usuario.
            const { data: queueItems, error: queueError } = await supabase
                .from('import_queue')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: true })
                .limit(10);

            if (queueError) throw new Error(`Error getting queue: ${queueError.message}`);

            if (!queueItems || queueItems.length === 0) {
                keepProcessing = false;
                break;
            }

            // Coleccionar IDs de usuarios para verificar si su importación ha finalizado
            queueItems.forEach(item => userIdsEncountered.add(item.user_id));

            console.log(`Processing batch of ${queueItems.length} items... (Elapsed: ${elapsedTime}ms)`);

            // 3. Procesar items individualmente
            const results = await Promise.allSettled(queueItems.map(async (item) => {
                const payload = item.payload;
                // Marcar como procesando
                await supabase.from('import_queue')
                    .update({ status: 'processing', updated_at: new Date().toISOString() })
                    .eq('id', item.id);

                try {
                    await processQueueItem(supabase, item.user_id, item.payload);
                    // Eliminar de la cola si es exitoso para evitar re-procesamiento
                    await supabase.from('import_queue').delete().eq('id', item.id);
                    return item.id;
                } catch (err: any) {
                    console.error(`Item failed ${item.id}:`, err);
                    // Marcar como fallido para reintento o inspección
                    await supabase.from('import_queue')
                        .update({ status: 'failed', error_message: err.message || 'Error', updated_at: new Date().toISOString() })
                        .eq('id', item.id);
                    throw err;
                }
            }));

            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const failCount = results.filter(r => r.status === 'rejected').length;

            totalProcessed += queueItems.length;
            totalSuccess += successCount;
            totalFailed += failCount;

            // Si trajimos menos del límite, es que ya no hay más pendientes, terminamos el bucle
            if (queueItems.length < 10) {
                keepProcessing = false;
            }
        }

        // 4. Trigger recursivo: verificamos si quedan items pendientes (Globales)
        const { count } = await supabase
            .from('import_queue')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        const hasMore = count && count > 0;

        // 5. Trigger de Recálculo de Estadísticas (Inteligente) - REMOVED
        // La nueva lógica de base de datos normalizada calcula rankings al vuelo.
        // No es necesario disparar workers de estadísticas.

        if (hasMore) {
            const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/process-import`;
            console.log(`Triggering recursion. items remaining: ${count}`);

            // Disparo "Fire & Forget" con AbortController para no esperar respuesta
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            try {
                await fetch(workerUrl, {
                    method: 'POST',
                    headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
                    signal: controller.signal
                });
            } catch (err: any) {
                if (err.name === 'AbortError') console.log('Recursive trigger sent.');
                else console.error('Error triggering recursion:', err);
            } finally {
                clearTimeout(timeoutId);
            }
        }

        return NextResponse.json({
            processed: totalProcessed,
            success: totalSuccess,
            failed: totalFailed,
            recursive: !!hasMore,
            remaining: count
        });

    } catch (error: any) {
        console.error("Worker Global Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function processQueueItem(supabase: any, userId: string, movie: any) {
    // 1. Insertar/Actualizar Película Básica
    const { data: savedMovie, error: movieError } = await supabase.from('movies').upsert({
        imdb_id: movie.imdb_id,
        title: movie.title,
        year: movie.year,
        director: movie.directors,
        genres: movie.genres ? movie.genres.split(',').map((g: any) => g.trim()) : [],
        imdb_rating: movie.imdb_rating,
        extended_data: {
            technical: {
                runtime: movie.runtime_mins,
            }
        }
    }, { onConflict: 'imdb_id' }).select('id, extended_data, poster_url').single();

    if (movieError || !savedMovie) throw new Error(`Movie Save Error: ${movieError?.message}`);

    // 2. Insertar Reseña
    if (movie.user_rating) {
        await supabase.from('reviews').upsert({
            user_id: userId,
            movie_id: savedMovie.id,
            rating: movie.user_rating,
            created_at: movie.date_rated ? new Date(movie.date_rated).toISOString() : new Date().toISOString(),
        }, { onConflict: 'user_id, movie_id' });
    }

    // 3. Watchlist (Posición y Calificación)
    if (movie.position || movie.user_rating) {
        const watchlistData: any = {
            user_id: userId,
            movie_id: savedMovie.id,
            updated_at: new Date().toISOString(),
        };
        if (movie.position) watchlistData.position = movie.position;
        if (movie.user_rating) watchlistData.user_rating = movie.user_rating;

        await supabase.from('watchlists').upsert(watchlistData, { onConflict: 'user_id, movie_id' });
    }

    // 4. Enriquecimiento de datos
    // Optimización: Si ya tenemos extended_data, runtime y fotos, evitamos llamar a TMDB.
    const hasExtendedData = savedMovie.extended_data &&
        savedMovie.extended_data.technical &&
        savedMovie.extended_data.technical.runtime &&
        savedMovie.extended_data.crew_details &&
        savedMovie.poster_url;

    // 5. Vincular a Historial de Importación
    if (movie.import_id) {
        const { error: linkError } = await supabase.from('import_items').insert({
            import_id: movie.import_id,
            movie_id: savedMovie.id,
            user_id: userId
        }).select().single();

        // Ignorar duplicados (23505)
        if (linkError && linkError.code !== '23505') {
            console.error(`Error vinculando película ${savedMovie.id} al import ${movie.import_id}:`, linkError);
        }
    }

    if (!hasExtendedData) {
        console.log(`Enriching missing data for: ${movie.imdb_id}`);
        await enrichMovieData(supabase, savedMovie.id, movie.imdb_id);
    } else {
        // console.log(`Skipping enrichment (already exists): ${movie.imdb_id}`);
    }
}

// Obtiene detalles adicionales de TMDB (créditos, videos, etc.)
async function enrichMovieData(supabase: any, movieId: string, imdbId: string) {
    const details = await tmdb.findByImdbId(imdbId);

    if (details) {
        // Sync people to relational tables
        if (details.credits) {
            await syncMoviePeople(supabase, movieId, details.credits);
        }

        const certification = details.release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates[0]?.certification;
        const trailer = details.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')?.key;

        const extendedData = {
            cast: details.credits.cast.slice(0, 50).map((c: any) => ({
                name: c.name,
                role: c.character,
                photo: TmdbClient.getImageUrl(c.profile_path, 'w185')
            })),
            crew: {
                director: details.credits.crew.filter((c: any) => c.job === 'Director').map((c: any) => c.name).join(', '),
                screenplay: details.credits.crew.find((c: any) => c.job === 'Screenplay' || c.job === 'Writer')?.name,
                photography: details.credits.crew.find((c: any) => c.job === 'Director of Photography')?.name,
                music: details.credits.crew.find((c: any) => c.job === 'Original Music Composer')?.name
            },
            // IMPORTANTE: Incluimos detalles del crew (con fotos) para los rankings
            crew_details: details.credits.crew
                .filter((c: any) => ['Director', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer'].includes(c.job))
                .map((c: any) => ({
                    name: c.name,
                    job: c.job,
                    photo: TmdbClient.getImageUrl(c.profile_path, 'w185')
                })),
            technical: {
                runtime: details.runtime,
                budget: details.budget,
                revenue: details.revenue,
                vote_average: details.vote_average,
                vote_count: details.vote_count,
                genres: details.genres.map((g: any) => g.name),
                overview: details.overview,
                certification: certification,
                trailer_key: trailer,
                tagline: details.tagline
            },
            // ESTRATEGIA: Worker NO procesa recomendaciones para maximizar velocidad.
            // Se cargarán "on-demand" vía getMovie la primera vez que se visite la película.
            // Esto reduce dramáticamente el tiempo de importación inicial.
            recommendations: []
        };

        await supabase.from('movies').update({
            extended_data: extendedData,
            poster_url: TmdbClient.getImageUrl(details.poster_path, 'w500'),
            synopsis: details.overview,
            director: extendedData.crew.director,
            genres: extendedData.technical.genres,
        }).eq('id', movieId);
    }
}
