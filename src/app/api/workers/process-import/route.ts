import { createClient } from '@supabase/supabase-js';
import { tmdb, TmdbClient } from '@/lib/tmdb';
import { NextRequest, NextResponse } from 'next/server';



// Tiempo máximo de ejecución por lote (Vercel serverless tiene límites, seremos conservadores)
// Idealmente usaríamos Edge Runtime pero TMDB client usa fetch node-style a veces,
// mantenemos nodejs runtime por compatibilidad con la base de código existente.
// Tiempo máximo de ejecución por lote (Vercel serverless tiene límites)
export const maxDuration = 60; // 60 segundos
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

        // Loop de procesamiento: Se mantiene vivo mientras tenga tiempo (< 50s)
        while (keepProcessing) {
            const elapsedTime = Date.now() - startTime;
            // Si pasaron más de 50 segundos, paramos para permitir el trigger recursivo seguro
            if (elapsedTime > 50000) {
                console.log(`Time limit reached (${elapsedTime}ms). Stopping loop.`);
                break;
            }

            // 2. Obtener items pendientes
            const { data: queueItems, error: queueError } = await supabase
                .from('import_queue')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: true })
                .limit(10); // Lotes de 10 para feedback rápido

            if (queueError) throw new Error(`Error getting queue: ${queueError.message}`);

            if (!queueItems || queueItems.length === 0) {
                keepProcessing = false;
                break;
            }

            console.log(`Processing batch of ${queueItems.length} items... (Elapsed: ${elapsedTime}ms)`);

            // 3. Procesar items
            const results = await Promise.allSettled(queueItems.map(async (item) => {
                const payload = item.payload;
                await supabase.from('import_queue')
                    .update({ status: 'processing', updated_at: new Date().toISOString() })
                    .eq('id', item.id);

                try {
                    await processQueueItem(supabase, item.user_id, payload);
                    await supabase.from('import_queue').delete().eq('id', item.id);
                    return item.id;
                } catch (err: any) {
                    console.error(`Item failed ${item.id}:`, err);
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

            // Si trajimos menos del límite (10), es que ya no hay más pendientes
            if (queueItems.length < 10) {
                keepProcessing = false;
            }
        }

        // 4. Trigger recursivo?
        // Verificamos si TODAVÍA quedan items pendientes (por si salimos por timeout)
        const { count } = await supabase
            .from('import_queue')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        const hasMore = count && count > 0;

        if (hasMore) {
            const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/process-import`;
            console.log(`Triggering recursion. items remaining: ${count}`);

            // Fire & Forget con AbortController
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

// Lógica de Negocio (Movida aquí para ejecutarse en background)
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
            // movie_name y user_name se omiten por brevedad, idealmente triggers DB los manejan
        }, { onConflict: 'user_id, movie_id' });
    }

    // 3. Watchlist
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

    // 4. ENRIQUECIMIENTO (La parte pesada)
    // Verificar si ya tiene data completa para no gastar API calls de TMDB innecesariamente
    // Optimización: Si ya tenemos extended_data y runtime, asumimos que está enriquecido.
    const hasExtendedData = savedMovie.extended_data &&
        savedMovie.extended_data.technical &&
        savedMovie.extended_data.technical.runtime &&
        savedMovie.poster_url;

    if (!hasExtendedData) {
        console.log(`Enriching missing data for: ${movie.imdb_id}`);
        await enrichMovieData(supabase, savedMovie.id, movie.imdb_id);
    } else {
        // console.log(`Skipping enrichment (already exists): ${movie.imdb_id}`);
    }
}

// Misma lógica de enriquecimiento que ya teníamos, adaptada
async function enrichMovieData(supabase: any, movieId: string, imdbId: string) {
    // console.log(`Enriching ${imdbId}...`);
    const details = await tmdb.findByImdbId(imdbId);

    if (details) {
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
            // IMPORTANTE: Incluimos lo nuevo que implementamos (fotos crew)
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
            }
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
