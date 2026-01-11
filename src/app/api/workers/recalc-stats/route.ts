

import { NextRequest, NextResponse } from 'next/server';
import { calculateRankings, RankingCategory } from '@/features/rankings/logic';
// Usar cliente directo de supabase-js para acceso con Rol de Admin/Servicio
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // 60 segundos (Timeout de Serverless)
export const dynamic = 'force-dynamic';

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

// Secuencia de ejecución para dividir la carga
const RANKING_STEPS: RankingCategory[] = [
    'director',
    'genre',
    'year',
    'screenplay',
    'photography',
    'music',
    'actor' // El más pesado al final
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const currentStep = (searchParams.get('step') as RankingCategory) || 'director';

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // MECANISMO DE SOFT TIMEOUT
    const TIME_LIMIT = 55000; // 55 segundos
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SOFT_TIMEOUT')), TIME_LIMIT)
    );

    try {
        console.log(`[Worker] Starting stats recalc for ${userId} [Step: ${currentStep}]`);

        const workerLogic = async () => {
            const start = Date.now();
            const supabase = getAdminClient();

            // 1. Calcular Rankings (Solo para la categoría actual)
            const stats = await calculateRankings(userId, supabase, currentStep);

            console.log(`[Worker] Calculated ${stats.length} stats for ${currentStep} in ${Date.now() - start}ms`);

            // 2. Upsert por lotes en user_statistics
            const payload = stats.map(s => ({
                user_id: userId,
                type: s.type,
                key: s.key,
                count: s.count,
                score: s.score,
                data: s.data, // JSONB
                updated_at: new Date().toISOString()
            }));

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

            // 3. Determinar siguiente paso o finalizar
            const currentIndex = RANKING_STEPS.indexOf(currentStep);
            const nextStep = RANKING_STEPS[currentIndex + 1];

            if (nextStep) {
                // RECURSIÓN: Disparar el siguiente paso
                console.log(`[Worker] Step ${currentStep} complete. Triggering ${nextStep}...`);

                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                const nextUrl = `${appUrl}/api/workers/recalc-stats?userId=${userId}&step=${nextStep}`;

                // Fire-and-forget (Async Trigger)
                // NO usar 'await' aquí. Si esperamos, creamos una cadena de latencia:
                // Paso 1 espera a Paso 2 (que espera a Paso 3...).
                // Al quitar await, permitimos que el Paso 1 termine y libere recursos 
                // mientras la red/plataforma inicia el Paso 2 independientemente.
                fetch(nextUrl, {
                    method: 'GET',
                    headers: {
                        'x-cron-secret': process.env.CRON_SECRET || '',
                        'Content-Type': 'application/json'
                    },
                    // Timeout corto solo para el handshake inicial si fuera necesario, 
                    // aunque sin await, el catch capturará errores de despacho inmediato.
                }).catch(err => console.error(`[Worker] Failed to dispatch next step ${nextStep}`, err));

                return {
                    success: true,
                    step: currentStep,
                    next: nextStep,
                    count: upsertedCount,
                    status: 'step_completed' // Indicar que este paso terminó
                };

            } else {
                // FIN DEL PROCESO
                console.log(`[Worker] All steps completed for ${userId}. Updating profile status.`);

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
                    step: currentStep,
                    status: 'completed',
                    count: upsertedCount,
                    totalTime: Date.now() - start // Tiempo de este paso
                };
            }
        };

        // Ejecutar lógica con race
        const result = await Promise.race([workerLogic(), timeoutPromise]);
        return NextResponse.json(result);

    } catch (e: unknown) {
        console.error(`[Worker] Error/Timeout in step ${currentStep}:`, e);

        // Recuperación: Forzar estado a IDLE para que la UI no se cuelgue
        try {
            const recoveryClient = getAdminClient();
            await recoveryClient
                .from('profiles')
                .update({ stats_status: 'error' }) // Marcamos error
                .eq('id', userId);
        } catch (recoveryError) {
            console.error('Failed to update stats_status during error recovery:', recoveryError);
        }

        const msg = e instanceof Error ? (e.message === 'SOFT_TIMEOUT' ? 'Worker timed out safely' : e.message) : 'Unknown error';
        return NextResponse.json({ error: msg, step: currentStep }, { status: 500 });
    }
}

// Soportar POST también
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;
    const url = new URL(request.url);
    if (userId) url.searchParams.set('userId', userId);
    // Preservar step si viene en body, aunque suele venir en URL
    if (body.step) url.searchParams.set('step', body.step);

    return GET(new NextRequest(url, request));
}
