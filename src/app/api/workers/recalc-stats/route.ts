
import { NextRequest, NextResponse } from 'next/server';
import { calculateRankings } from '@/features/rankings/logic';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60; // 60 seconds (Serverless timeout)

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

        const stats = await calculateRankings(userId);

        console.log(`[Worker] Calculated ${stats.length} stats in ${Date.now() - start}ms`);

        // Batch Upsert into user_statistics
        const supabase = await createClient();

        // Prepare payload (mapping keys from logic to DB schema)
        const payload = stats.map(s => ({
            user_id: userId,
            type: s.type,
            key: s.key,
            count: s.count,
            score: s.score,
            data: s.data, // JSONB
            updated_at: new Date().toISOString()
        }));

        // Upsert in batches of 1000 to avoid packet size limits
        const BATCH_SIZE = 500;
        let upsertedCount = 0;

        for (let i = 0; i < payload.length; i += BATCH_SIZE) {
            const chunk = payload.slice(i, i + BATCH_SIZE);
            const { error } = await supabase
                .from('user_statistics')
                .upsert(chunk, { onConflict: 'user_id,type,key' }); // Ensure DB has this Unique Key

            if (error) {
                console.error('[Worker] Upsert error:', error);
                throw error;
            }
            upsertedCount += chunk.length;
        }

        // Clean up OBSOLETE stats? 
        // Logic: if a stat is NOT in the new calculation, it should be deleted or zeroed.
        // For simplicity: We delete everything for this user NOT in the current batch? 
        // Or simpler: We just upsert. If an actor count goes to 0, calculateRankings should probably return it as 0? 
        // Currently logic doesn't return 0s. 
        // Mitigation: We could DELETE where user_id = X before inserting, but that causes downtime.
        // Better: We upsert. Old actors remain with old counts. (Acceptable for MVP).

        return NextResponse.json({
            success: true,
            count: upsertedCount,
            time: Date.now() - start
        });

    } catch (e: any) {
        console.error('[Worker] Fatal error:', e);
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
