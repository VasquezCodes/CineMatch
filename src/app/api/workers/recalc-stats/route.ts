
import { NextRequest, NextResponse } from 'next/server';
import { calculateRankings } from '@/features/rankings/logic';
// Usar cliente directo de supabase-js para acceso con Rol de Admin/Servicio
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // 60 segundos (Timeout de Serverless)

// Helper para obtener cliente Admin
const getAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        }
    );
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // MECANISMO DE SOFT TIMEOUT
    // Ejecutamos la lógica principal contra una promesa de timeout (ej. 55s)
    // Si gana el timeout, lanzamos un error que es capturado abajo para limpiar.
    const TIME_LIMIT = 55000; // 55 segundos
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SOFT_TIMEOUT')), TIME_LIMIT)
    );

    try {
        console.log(`[Worker] Starting stats recalc for ${userId}`);

        // Envolver la lógica principal en una promesa
        const workerLogic = async () => {
            const start = Date.now();
            const supabase = getAdminClient();

            const stats = await calculateRankings(userId, supabase);

            console.log(`[Worker] Calculated ${stats.length} stats in ${Date.now() - start}ms`);

            // Upsert por lotes en user_statistics
            const payload = stats.map(s => ({
                user_id: userId,
                type: s.type,
                key: s.key,
                count: s.count,
                score: s.score,
                data: s.data, // JSONB
                updated_at: new Date().toISOString()
            }));

            // Tamaño de lote reducido para estabilidad
            const BATCH_SIZE = 100;
            const upsertPromises = [];

            for (let i = 0; i < payload.length; i += BATCH_SIZE) {
                const chunk = payload.slice(i, i + BATCH_SIZE);
                upsertPromises.push(
                    supabase
                        .from('user_statistics')
                        .upsert(chunk, { onConflict: 'user_id,type,key' })
                        .then(({ error }) => {
                            if (error) {
                                console.error('[Worker] Upsert batch error:', error);
                                throw error;
                            }
                            return chunk.length;
                        })
                );
            }

            const results = await Promise.all(upsertPromises);
            const upsertedCount = results.reduce((acc, count) => acc + count, 0);

            // 5. Actualizar Timestamp y Estado del Perfil
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    last_stats_recalc: new Date().toISOString(),
                    stats_status: 'idle'
                })
                .eq('id', userId);

            if (profileError) {
                console.error('[Worker] Failed to update profile timestamp:', profileError);
                throw profileError;
            }

            return {
                success: true,
                count: upsertedCount,
                time: Date.now() - start
            };
        };

        // Ejecutar lógica con race
        const result = await Promise.race([workerLogic(), timeoutPromise]);
        return NextResponse.json(result);

    } catch (e: unknown) {
        console.error('[Worker] Error/Timeout:', e);

        // Recuperación: Forzar estado a IDLE para que la UI no se cuelgue
        try {
            const recoveryClient = getAdminClient();
            console.log('[Worker] Attempting status recovery...');
            await recoveryClient
                .from('profiles')
                .update({ stats_status: 'idle' }) // O 'error' si queremos mostrar bandera roja
                .eq('id', userId);
        } catch (recoveryError) {
            console.error('Failed to reset stats_status during error recovery:', recoveryError);
        }

        const msg = e instanceof Error ? (e.message === 'SOFT_TIMEOUT' ? 'Worker timed out safely' : e.message) : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// Soportar POST también
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;
    const url = new URL(request.url);
    if (userId) url.searchParams.set('userId', userId);
    return GET(new NextRequest(url, request));
}
