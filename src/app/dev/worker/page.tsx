'use client';

import { useState } from 'react';

export default function WorkerDebugPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const triggerWorker = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            // Call an internal API route that triggers the worker (to handle the secret on server side)
            // OR call the worker directly if we skip the secret check for debugging? 
            // Better: Create a server action or proxy route? 
            // Let's assume we can call the worker directly if we know the secret (which we don't on client).
            // So we'll use a server action.
            const response = await fetch('/api/dev/trigger-worker', { method: 'POST' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to trigger');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Import Worker Debugger</h1>

            <div className="mb-6 p-4 bg-muted rounded">
                <p className="mb-2">Status: <strong>{loading ? 'Running...' : 'Idle'}</strong></p>
                <button
                    onClick={triggerWorker}
                    disabled={loading}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 disabled:opacity-50"
                >
                    Trigger Worker Process
                </button>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="p-4 bg-muted rounded border border-border">
                    <h2 className="font-semibold mb-2">Result:</h2>
                    <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-96">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
