
import { NextRequest, NextResponse } from 'next/server';
import { calculateRankings } from '@/features/rankings/logic';
// Use direct supabase-js client for Admin/Service Role access
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // 60 seconds (Serverless timeout)

// Helper to get Admin Client
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
    const secret = request.headers.get('x-cron-secret');

    // Security check: either authenticated admin/worker secret OR user triggering their own recalc
    // For MVP/Debug: allow if userId is present. Ideally protect with Secret.
    // if (secret !== process.env.CRON_SECRET) { ... }

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        console.log(`[Worker] Starting stats recalc for ${userId}`);
        const start = Date.now();

        // Usamos Admin Client para saltar RLS tanto para leer (watchlists) como escribir (user_statistics)
        // Esto es necesario porque el worker se ejecuta en el servidor sin sesión de usuario.
        const supabase = getAdminClient();

        const stats = await calculateRankings(userId, supabase);

        console.log(`[Worker] Calculated ${stats.length} stats in ${Date.now() - start}ms`);

        // Batch Upsert into user_statistics

        // Preparar payload (mapeando desde la lógica al esquema de BD)
        const payload = stats.map(s => ({
            user_id: userId,
            type: s.type,
            key: s.key,
            count: s.count,
            score: s.score,
            data: s.data, // JSONB
            updated_at: new Date().toISOString()
        }));

        // Upsert en lotes de 500 para evitar límites de tamaño de paquete
        // Upsert en lotes paralelos para máxima velocidad
        // Usamos BATCH_SIZE de 500 para balancear carga de red y memoria.
        const BATCH_SIZE = 500;
        const upsertPromises = [];

        for (let i = 0; i < payload.length; i += BATCH_SIZE) {
            const chunk = payload.slice(i, i + BATCH_SIZE);

            // Creamos la promesa pero no la esperamos inmediatamente
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

        // Esperamos a que todos terminen
        const results = await Promise.all(upsertPromises);
        let upsertedCount = results.reduce((acc, count) => acc + count, 0);

        // Limpieza de estadísticas obsoletas:
        // Idealmente deberíamos borrar las que ya no existen, pero por ahora el upsert es suficiente para MVP.
        // Las estadísticas viejas permanecen (ej. actor que ya no tienes películas) hasta que se haga un reset completo.

        // 5. Actualizar Timestamp del Perfil para señalar completitud al Frontend
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                last_stats_recalc: new Date().toISOString(),
                stats_status: 'idle' // Volvemos a estado 'idle' (listo) para que la UI se actualice
            })
            .eq('id', userId);

        if (profileError) {
            console.error('[Worker] Failed to update profile timestamp:', profileError);
        }

        return NextResponse.json({
            success: true,
            count: upsertedCount,
            time: Date.now() - start
        });

    } catch (e: any) {
        console.error('[Worker] Fatal error:', e);

        // Intentar revertir el estado a 'idle' para no bloquear la UI
        // Recuperación ante fallos: 
        // Si el cálculo explota, forzamos el estado a 'idle' para que la UI no se quede pegada en "Generando..."
        try {
            const recoveryClient = getAdminClient();
            await recoveryClient.from('profiles').update({ stats_status: 'idle' }).eq('id', userId);
        } catch (recoveryError) {
            console.error('Failed to reset stats_status during error recovery:', recoveryError);
        }

        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Support POST as well
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;
    // Reuse logic...
    // simpler to redir to GET handler or extract function
    const url = new URL(request.url);
    if (userId) url.searchParams.set('userId', userId);
    return GET(new NextRequest(url, request));
}
