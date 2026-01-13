"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Star, Tag } from "lucide-react";
import type { AnalysisData } from "@/features/insights/actions";

interface AnalysisStatsProps {
  data: AnalysisData;
}

export function AnalysisStats({ data }: AnalysisStatsProps) {
  // Obtener género favorito (el que tiene más películas)
  const topGenre = Object.entries(data.genreDistribution).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Obtener rating más común
  const topRating = Object.entries(data.ratingDistribution).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Películas</CardTitle>
          <Film className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalMovies}</div>
          <p className="text-xs text-muted-foreground">En tu biblioteca</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.averageRating > 0 ? data.averageRating.toFixed(1) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topRating
              ? `${topRating[1]} películas con ${topRating[0]}★`
              : "Basado en tus reviews"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Género Favorito</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topGenre?.[0] || "N/A"}</div>
          <p className="text-xs text-muted-foreground">
            {topGenre ? `${topGenre[1]} películas` : "Sin géneros"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
