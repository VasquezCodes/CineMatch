import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const workerUrl = `${appUrl}/api/workers/process-import`;
        const secret = process.env.CRON_SECRET;

        console.log(`[DevDebug] Triggering worker at ${workerUrl}`);

        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cron-secret': secret || '',
            },
        });

        const data = await response.json();

        return NextResponse.json({
            status: response.status,
            ok: response.ok,
            data: data
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
