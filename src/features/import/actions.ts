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
    // para evitar duplicados si el usuario sube el mismo archivo varias veces o spamea el botón.
    const uniqueImdbIds = [...new Set(movies.map(m => m.imdb_id))];

    // Consulta optimizada para verificar existencia
    const { data: existingItems } = await (await supabase)
        .from('import_queue')
        .select('payload')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing']); // Solo nos importa si ya se está procesando o va a ser procesado

    // Extraer IDs existentes de forma segura (payload es jsonb, en TS puede ser any)
    const existingImdbIds = new Set<string>();
    if (existingItems) {
        existingItems.forEach((item: any) => {
            if (item.payload && item.payload.imdb_id) {
                existingImdbIds.add(item.payload.imdb_id);
            }
        });
    }

    // Filtrar películas que NO están en la cola
    const moviesToInsert = movies.filter(m => !existingImdbIds.has(m.imdb_id));
    const duplicateCount = movies.length - moviesToInsert.length;

    console.log(`Import: ${movies.length} total, ${duplicateCount} duplicados ignorados, ${moviesToInsert.length} a insertar.`);

    if (moviesToInsert.length === 0) {
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

    // Disparar el Worker Asíncronamente (Disparar y Olvidar)
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
// El antiguo enrichMovieData fue eliminado ya que ahora está en el worker
