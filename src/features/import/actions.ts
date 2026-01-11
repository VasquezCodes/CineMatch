'use server';

import { createClient } from '@/lib/supabase/server';
import { tmdb, TmdbClient } from '@/lib/tmdb';
import { revalidatePath } from 'next/cache';

export type CsvMovieImport = {
    imdb_id: string; // Const
    title: string;
    year: number;
    user_rating?: number; // Tu Calificación
    date_rated?: string; // Fecha de Calificación
    genres?: string;
    url?: string;
    imdb_rating?: number; // Calificación IMDb
    runtime_mins?: number; // Duración (mins)
    release_date?: string; // Fecha de Lanzamiento
    directors?: string; // Directores
    num_votes?: number; // Núm Votos
    position?: number; // Orden en lista
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

    // Obtener items ya en cola para este usuario (pending o processing)
    // Para evitar duplicados si el usuario intenta importar el mismo archivo múltiples veces.
    const uniqueImdbIds = [...new Set(movies.map(m => m.imdb_id))];

    // Consulta optimizada para verificar existencia en la cola
    const { data: existingItems } = await (await supabase)
        .from('import_queue')
        .select('payload')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing']); // Filtramos por lo que está activo

    // Extraer IDs existentes de forma segura
    const existingImdbIds = new Set<string>();
    if (existingItems) {
        existingItems.forEach((item: any) => {
            if (item.payload && item.payload.imdb_id) {
                existingImdbIds.add(item.payload.imdb_id);
            }
        });
    }

    // Filtrar películas que ya están en cola para evitar re-encolar
    const moviesToInsert = movies.filter(m => !existingImdbIds.has(m.imdb_id));
    const duplicateCount = movies.length - moviesToInsert.length;

    console.log(`Import: ${movies.length} total, ${duplicateCount} duplicados ignorados, ${moviesToInsert.length} a insertar.`);

    // Si no hay nuevas, pero hay pendientes, intentamos despertar al worker por si acaso se detuvo.
    const hasPendingItems = existingItems && existingItems.length > 0;

    if (moviesToInsert.length === 0) {
        if (hasPendingItems) {
            console.log("No new movies, but pending items found. Retrying worker trigger...");
            triggerWorker(user.id);
        }

        return {
            success: true,
            total: movies.length,
            new_movies: 0,
            updated_movies: 0,
            errors: 0
        };
    }

    for (let i = 0; i < moviesToInsert.length; i += BATCH_SIZE) {
        const batch = moviesToInsert.slice(i, i + BATCH_SIZE);

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



    // Disparar worker tras insertar
    triggerWorker(user.id);

    revalidatePath('/app/library');

    return {
        success: true,
        total: movies.length,
        new_movies: queuedCount, // Semánticamente cambió: ahora significa "encolado"
        updated_movies: 0,
        errors: errorCount
    };
}
// Helper para activar los workers de fondo
function triggerWorker(userId: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const workerUrl = `${appUrl}/api/workers/process-import`;
    const statsUrl = `${appUrl}/api/workers/recalc-stats?userId=${userId}`;

    try {
        console.log("Activando worker:", workerUrl);
        // LLamada asíncrona (Fire & Forget) con timeout corto
        fetch(workerUrl, {
            method: 'POST',
            headers: {
                'x-cron-secret': process.env.CRON_SECRET || '',
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(500) // 500ms para asegurar que la petición sale
        }).catch(err => {
            if (err.name === 'TimeoutError') console.log("Worker activado (timeout esperado)");
            else console.error("Fallo al activar worker:", err);
        });

        // Trigger Stats Recalc Async - REMOVIDO: Ahora es manejado por el worker `process-import` al finalizar.
        // Esto evita condiciones de carrera donde se calculan stats con datos incompletos.
        // fetch(statsUrl, { method: 'GET', signal: AbortSignal.timeout(500) }).catch(() => { });

    } catch (e) {
        // Catch silencioso
    }
}
