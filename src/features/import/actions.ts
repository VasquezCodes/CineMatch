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

export async function processImport(movies: CsvMovieImport[], filename: string): Promise<ImportResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Usuario no autenticado');
    }

    // 1. Crear registro de importación
    const { data: importRecord, error: importError } = await supabase
        .from('user_imports')
        .insert({
            user_id: user.id,
            filename: filename,
            status: 'processing',
            counts: { total: movies.length, new: 0, updated: 0 }
        })
        .select('id')
        .single();

    if (importError || !importRecord) {
        throw new Error(`Error creando registro de importación: ${importError?.message}`);
    }

    const importId = importRecord.id;
    let queuedCount = 0;
    let errorCount = 0;

    // Procesamiento por lotes para insertar en la cola
    const BATCH_SIZE = 100;

    // Obtener items ya en cola para este usuario (pending o processing)
    const { data: existingItems } = await supabase
        .from('import_queue')
        .select('payload')
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing']);

    // Extraer IDs existentes
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

    console.log(`Import: ${movies.length} total, ${duplicateCount} duplicados en cola, ${moviesToInsert.length} a insertar. Import ID: ${importId}`);

    // Encolamos todas las películas del CSV para asegurar la vinculación con este Import ID.
    // El worker maneja la idempotencia: si la película ya existe, solo crea el link en 'import_items'.

    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);

        const queueItems = batch.map(movie => ({
            user_id: user.id,
            payload: { ...movie, import_id: importId }, // Adjuntamos import_id
            status: 'pending'
        }));

        const { error } = await supabase
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
        new_movies: queuedCount,
        updated_movies: 0,
        errors: errorCount
    };
}
// Helper para activar los workers de fondo
function triggerWorker(userId: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const workerUrl = `${appUrl}/api/workers/process-import`;

    try {
        console.log("Activando worker:", workerUrl);
        // LLamada asíncrona (Fire & Forget) con timeout corto
        fetch(workerUrl, {
            method: 'POST',
            headers: {
                'x-cron-secret': process.env.CRON_SECRET || '',
                'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(500) // 500ms para asegurar que la petición sale sin bloquear
        }).catch(err => {
            if (err.name === 'TimeoutError') console.log("Worker activado (timeout esperado)");
            else console.error("Fallo al activar worker:", err);
        });

    } catch (e) {
        // Catch silencioso
    }
}

export type UserImport = {
    id: string;
    filename: string;
    imported_at: string;
    status: string;
    counts: any;
};

export async function getImports(): Promise<UserImport[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('user_imports')
        .select('*')
        .eq('user_id', user.id)
        .order('imported_at', { ascending: false });

    return data || [];
}

export async function deleteImport(importId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Identificar ítems huérfanos
    const { data: itemsToDelete } = await supabase
        .from('import_items')
        .select('movie_id')
        .eq('import_id', importId);

    if (itemsToDelete && itemsToDelete.length > 0) {
        const movieIdsToCheck = itemsToDelete.map(i => i.movie_id);

        // Verificar si existen referencias en otros imports
        const { data: otherReferences } = await supabase
            .from('import_items')
            .select('movie_id')
            .in('movie_id', movieIdsToCheck)
            .neq('import_id', importId)
            .eq('user_id', user.id);

        const protectedMovieIds = new Set(otherReferences?.map(r => r.movie_id));
        const orphanedMovieIds = movieIdsToCheck.filter(id => !protectedMovieIds.has(id));

        console.log(`Eliminando import ${importId}. Huérfanos: ${orphanedMovieIds.length}. Protegidos: ${protectedMovieIds.size}`);

        if (orphanedMovieIds.length > 0) {
            // Eliminar huérfanos de Watchlist y Reviews (Cleaning)
            await Promise.all([
                supabase.from('watchlists').delete().in('movie_id', orphanedMovieIds).eq('user_id', user.id),
                supabase.from('reviews').delete().in('movie_id', orphanedMovieIds).eq('user_id', user.id)
            ]);
        }
    }

    // 2. Eliminar registro de importación (Cascade borra los items vinculados)
    const { error } = await supabase.from('user_imports').delete().eq('id', importId).eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/app/library');
    revalidatePath('/app/settings/imports');
    return { success: true };
}
