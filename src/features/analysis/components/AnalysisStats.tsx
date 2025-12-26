"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Star, Calendar, Tag } from "lucide-react";
import type { WatchlistAnalysisItem } from "../types";

interface AnalysisStatsProps {
  data: WatchlistAnalysisItem[];
}

export function AnalysisStats({ data }: AnalysisStatsProps) {
  // Calcular estadísticas
  const totalMovies = data.length;

  const ratingsWithValues = data.filter(
    (item) => item.watchlist.user_rating !== null
  );
  const averageRating =
    ratingsWithValues.length > 0
      ? ratingsWithValues.reduce(
          (sum, item) => sum + (item.watchlist.user_rating || 0),
          0
        ) / ratingsWithValues.length
      : 0;

  // Géneros más comunes
  const genresCount = new Map<string, number>();
  data.forEach((item) => {
    const genres = item.movie.genres as string[] | null;
    if (genres && Array.isArray(genres)) {
      genres.forEach((genre) => {
        genresCount.set(genre, (genresCount.get(genre) || 0) + 1);
      });
    }
  });
  const topGenres = Array.from(genresCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Década más vista
  const decadesCount = new Map<string, number>();
  data.forEach((item) => {
    if (item.movie.year) {
      const decade = Math.floor(item.movie.year / 10) * 10;
      const decadeLabel = `${decade}s`;
      decadesCount.set(decadeLabel, (decadesCount.get(decadeLabel) || 0) + 1);
    }
  });
  const topDecade = Array.from(decadesCount.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Películas
          </CardTitle>
          <Film className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMovies}</div>
          <p className="text-xs text-muted-foreground">
            Importadas desde tu CSV
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rating Promedio</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {ratingsWithValues.length > 0
              ? `Basado en ${ratingsWithValues.length} ratings`
              : "Sin ratings registrados"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Género Favorito</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topGenres[0]?.[0] || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topGenres[0] ? `${topGenres[0][1]} películas` : "Sin géneros"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Década Favorita</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topDecade?.[0] || "N/A"}</div>
          <p className="text-xs text-muted-foreground">
            {topDecade ? `${topDecade[1]} películas` : "Sin años registrados"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

