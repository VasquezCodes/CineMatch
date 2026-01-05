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

            <div className="mb-6 p-4 bg-gray-100 rounded">
                <p className="mb-2">Status: <strong>{loading ? 'Running...' : 'Idle'}</strong></p>
                <button
                    onClick={triggerWorker}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Trigger Worker Process
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="p-4 bg-green-50 rounded border border-green-200">
                    <h2 className="font-semibold mb-2">Result:</h2>
                    <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-96">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
