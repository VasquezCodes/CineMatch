"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRanking, RankingType, RankingStatConfig } from "@/features/rankings/actions";
import { RankingAccordionRow } from "@/features/rankings/components/RankingAccordionRow";
import { createClient } from "@/lib/supabase/client";

interface RankingCategory {
  type: RankingType;
  label: string;
}

const RANKING_CATEGORIES: RankingCategory[] = [
  { type: "director", label: "Directores" },
  { type: "actor", label: "Actores" },
  { type: "genre", label: "Géneros" },
  { type: "year", label: "Años" },
  { type: "screenplay", label: "Guionistas" },
  { type: "photography", label: "Directores de Fotografía" },
  { type: "music", label: "Compositores" },
];

export default function RankingsDebugPage() {
  const [userId, setUserId] = useState("");
  const [rankings, setRankings] = useState<Record<RankingType, RankingStatConfig[]>>({} as Record<RankingType, RankingStatConfig[]>);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  const fetchAllRankings = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const results: Record<RankingType, RankingStatConfig[]> = {} as Record<RankingType, RankingStatConfig[]>;

      for (const category of RANKING_CATEGORIES) {
        const data = await getRanking(userId, category.type, { limit: 10, minRating: 1 });
        results[category.type] = data;
      }

      setRankings(results);
    } catch (e: any) {
      setError(e.message || "Error al cargar los rankings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Top 10 Rankings</h1>
          <p className="text-sm text-slate-600">
            Explora tus películas favoritas organizadas por categorías
          </p>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <input
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="User ID (UUID)"
          />
          <Button
            onClick={fetchAllRankings}
            disabled={loading || !userId}
            className="shrink-0"
          >
            {loading ? "Cargando..." : "Cargar Rankings"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {Object.keys(rankings).length > 0 && (
          <div className="space-y-8">
            {RANKING_CATEGORIES.map((category) => {
              const data = rankings[category.type];
              if (!data || data.length === 0) return null;

              return (
                <Card key={category.type} className="overflow-hidden border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-200/50 bg-slate-50/50 pb-4">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {data.map((item, index) => (
                      <RankingAccordionRow
                        key={item.key}
                        rank={index + 1}
                        name={item.key}
                        count={item.count}
                        score={item.score}
                        movies={item.data.movies}
                        imageUrl={item.data.image_url}
                        type={category.type}
                      />
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && Object.keys(rankings).length === 0 && userId && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-slate-500">
              Haz clic en "Cargar Rankings" para ver tus top 10
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
