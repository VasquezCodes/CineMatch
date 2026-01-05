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

    let queuedCount = 0;
    let errorCount = 0;

    // Procesamiento por lotes para insertar en la cola
    const BATCH_SIZE = 100; // Tamaño del lote para inserción en DB

    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);

        const queueItems = batch.map(movie => ({
            user_id: user.id,
            payload: movie as any, // Cast a JSON
            status: 'pending'
        }));

        const { error } = await (await supabase)
            .from('import_queue')
            .insert(queueItems);

        if (error) {
            console.error("Error al insertar en cola:", error);
            errorCount += batch.length;
        } else {
            queuedCount += batch.length;
        }
    }

    // Disparar el Worker Asíncronamente (Fire and Forget)
    // No esperamos la respuesta completa (o usamos un timeout muy corto).
    // Esto evita bloquear la UI mientras se inicia el proceso.

    // En Vercel serverless, es mejor 'disparar' y no esperar respuesta si queremos retornar rápido,
    // pero Vercel podría matar el request si la función retorna.
    // Sin embargo, como estamos llamando a una URL externa (nosotros mismos), el request de red sale.
    // Usamos un timeout corto para evitar bloquear la UI.

    // URL absoluta para el worker
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const workerUrl = `${appUrl}/api/workers/process-import`;

    try {
        console.log("Activando worker:", workerUrl);
        fetch(workerUrl, {
            method: 'POST',
            headers: {
                'x-cron-secret': process.env.CRON_SECRET || '',
                'Content-Type': 'application/json'
            },
            // Usamos AbortSignal para salir rápido, no nos importa la respuesta aquí,
            // solo queremos despertar al worker.
            signal: AbortSignal.timeout(200) // 200ms timeout
        }).catch(err => {
            // Ignorar errores de timeout, es esperado/deseable
            if (err.name === 'TimeoutError') {
                console.log("Worker activado (timeout esperado)");
            } else {
                console.error("Fallo al activar worker:", err);
            }
        });
    } catch (e) {
        // Catch silencioso
    }

    revalidatePath('/app/library');

    return {
        success: true,
        total: movies.length,
        new_movies: queuedCount, // Semánticamente cambió: ahora significa "encolado"
        updated_movies: 0,
        errors: errorCount
    };
}
// Old enrichMovieData removed as it is now in the worker
