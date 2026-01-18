import { createClient } from '@supabase/supabase-js';
import { tmdb, TmdbClient } from '@/lib/tmdb';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Worker para backfill de backdrop_url en películas existentes.
 * Obtiene el backdrop de TMDB para películas que no lo tienen.
 * 
 * Uso: POST /api/workers/backfill-backdrops
 * Header: x-cron-secret: <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // Verificar autorización
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
            auth: { autoRefreshToken: false, persistSession: false }
        });

        let totalProcessed = 0;
        let totalUpdated = 0;
        let totalSkipped = 0;
        let totalErrors = 0;

        // Obtener películas sin backdrop pero con tmdb_id
        const { data: movies, error: fetchError } = await supabase
            .from('movies')
            .select('id, tmdb_id, title')
            .is('backdrop_url', null)
            .not('tmdb_id', 'is', null)
            .limit(50); // Procesar en lotes pequeños

        if (fetchError) {
            throw new Error(`Error fetching movies: ${fetchError.message}`);
        }

        if (!movies || movies.length === 0) {
            return NextResponse.json({
                message: 'No movies to process',
                processed: 0
            });
        }

        console.log(`Processing ${movies.length} movies for backdrop backfill...`);

        // Configuración de paralelización
        const BATCH_SIZE = 5; // Peticiones concurrentes
        const BATCH_DELAY = 150; // ms entre lotes (TMDB ~40 req/s)

        // Función para procesar una película
        const processMovie = async (movie: { id: string; tmdb_id: number; title: string }) => {
            const details = await tmdb.getMovieDetails(movie.tmdb_id);

            if (!details) {
                // Marcar como procesado aunque falle (evita loop infinito)
                await supabase
                    .from('movies')
                    .update({ backdrop_url: '' })
                    .eq('id', movie.id);
                return { status: 'skipped' as const, movie };
            }

            const backdropUrl = TmdbClient.getBestBackdropUrl(details.images, details.backdrop_path);

            if (backdropUrl) {
                await supabase
                    .from('movies')
                    .update({ backdrop_url: backdropUrl })
                    .eq('id', movie.id);
                return { status: 'updated' as const, movie, backdropUrl };
            } else {
                // Marcar como procesado sin backdrop (usar string vacío para diferenciar de null)
                await supabase
                    .from('movies')
                    .update({ backdrop_url: '' })
                    .eq('id', movie.id);
                return { status: 'skipped' as const, movie };
            }
        };

        // Procesar en lotes paralelos
        for (let i = 0; i < movies.length; i += BATCH_SIZE) {
            const elapsed = Date.now() - startTime;
            if (elapsed > 50000) {
                console.log('Time limit approaching, stopping batch.');
                break;
            }

            const batch = movies.slice(i, i + BATCH_SIZE);
            const results = await Promise.allSettled(batch.map(movie => processMovie(movie)));

            // Contabilizar resultados
            for (const result of results) {
                totalProcessed++;
                if (result.status === 'fulfilled') {
                    if (result.value.status === 'updated') {
                        totalUpdated++;
                        console.log(`Updated backdrop: ${result.value.movie.title}`);
                    } else {
                        totalSkipped++;
                    }
                } else {
                    totalErrors++;
                    console.error('Batch error:', result.reason);
                }
            }

            // Delay entre lotes para respetar rate limits
            if (i + BATCH_SIZE < movies.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
            }
        }

        // Verificar si quedan más películas por procesar
        const { count } = await supabase
            .from('movies')
            .select('*', { count: 'exact', head: true })
            .is('backdrop_url', null)
            .not('tmdb_id', 'is', null);

        const hasMore = count && count > 0;

        // Trigger recursivo si hay más
        if (hasMore && totalProcessed > 0) {
            const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/backfill-backdrops`;
            console.log(`Triggering recursion. Movies remaining: ${count}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000);

            try {
                await fetch(workerUrl, {
                    method: 'POST',
                    headers: { 'x-cron-secret': process.env.CRON_SECRET || '' },
                    signal: controller.signal
                });
            } catch (err: unknown) {
                const errorName = err instanceof Error && 'name' in err ? err.name : 'Unknown';
                if (errorName === 'AbortError') {
                    console.log('Recursive trigger sent.');
                }
            } finally {
                clearTimeout(timeoutId);
            }
        }

        return NextResponse.json({
            processed: totalProcessed,
            updated: totalUpdated,
            skipped: totalSkipped,
            errors: totalErrors,
            remaining: count || 0,
            recursive: !!hasMore
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Backfill Backdrops Worker Error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
