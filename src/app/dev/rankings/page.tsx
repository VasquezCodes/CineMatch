"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRanking, RankingType } from "@/features/rankings/actions";

const RANKING_TYPES: RankingType[] = [
  "director",
  "actor",
  "genre",
  "year",
  "screenplay",
  "photography",
  "music",
];

export default function RankingsDebugPage() {
  const [selectedType, setSelectedType] = useState<RankingType>("director");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  // Se requiere un ID de usuario real para probar. En desarrollo, podemos ingresarlo o intentar obtener "me".
  // Pero getRanking espera userId como primer argumento.
  // Podemos intentar obtener el ID del usuario actual si estamos logueados, o permitir entrada manual.

  const { createClient } = require("@/lib/supabase/client");

  useState(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      if (data?.user) setUserId(data.user.id);
    });
  });

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Si no hay ID ingresado manualmente, asumimos que la server action podría manejarlo si lo modificamos a "me" o similar.
      // Pero getRanking actualmente REQUIERE una cadena userId.
      // Vamos a usar un ID conocido o obtener 'me' en el cliente?
      // De hecho, más fácil: usar el ID de los logs si está disponible, o simplemente obtener la sesión actual.
      // Pero por ahora, permitamos entrada manual o simplemente disparar.

      const res = await getRanking(userId, selectedType, { limit: 10, minRating: 1 });
      setResult(res);
    } catch (e: any) {
      setError(e.message || JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Rankings Debugger</h1>

      <Card>
        <CardHeader>
          <CardTitle>Test Params</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User ID (UUID)</label>
            <input
              className="border p-2 rounded w-full font-mono text-sm"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="e.g. invalid-uuid-will-fail"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Check Supabase or console for your User ID.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ranking Type</label>
            <div className="flex gap-2 flex-wrap">
              {RANKING_TYPES.map(t => (
                <Button
                  key={t}
                  variant={selectedType === t ? "default" : "outline"}
                  onClick={() => setSelectedType(t)}
                  size="sm"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleTest} disabled={loading || !userId}>
            {loading ? "Fetching..." : "Run Test"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
                Error: {error}
              </div>
            )}
            <pre className="bg-slate-950 text-slate-50 p-4 rounded overflow-auto max-h-[500px] text-xs">
              {result ? JSON.stringify(result, null, 2) : "No result"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
