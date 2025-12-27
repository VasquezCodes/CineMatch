"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MovieRatingCard } from "./MovieRatingCard";
import type { UnratedMovie } from "../types";
import { APP_ROUTES } from "@/config/routes";

interface RateMoviesGridProps {
  movies: UnratedMovie[];
}

export function RateMoviesGrid({ movies }: RateMoviesGridProps) {
  const router = useRouter();
  const [ratedMovies, setRatedMovies] = React.useState<Set<string>>(
    new Set(movies.filter((m) => m.currentRating !== null).map((m) => m.watchlistId))
  );

  const totalMovies = movies.length;
  const ratedCount = ratedMovies.size;
  const progressPercent = totalMovies > 0 ? (ratedCount / totalMovies) * 100 : 0;
  const allRated = ratedCount === totalMovies;

  const handleMovieRated = React.useCallback((watchlistId: string, rating: number) => {
    setRatedMovies((prev) => {
      const newSet = new Set(prev);
      newSet.add(watchlistId);
      return newSet;
    });
  }, []);

  const handleContinue = () => {
    router.push(APP_ROUTES.ANALYSIS);
  };

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {allRated ? (
              <span className="text-green-600 font-medium">
                ✓ Todas las películas calificadas
              </span>
            ) : (
              <>
                <span className="font-medium text-foreground">{ratedCount}</span> de{" "}
                <span className="font-medium text-foreground">{totalMovies}</span>{" "}
                películas calificadas
              </>
            )}
          </p>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Grid de películas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {movies.map((movie) => (
          <MovieRatingCard
            key={movie.watchlistId}
            movie={movie}
            onRated={handleMovieRated}
          />
        ))}
      </div>

      {/* Botón continuar */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!allRated}
          className="min-w-[200px]"
        >
          {allRated ? "Continuar al análisis" : "Califica todas las películas"}
        </Button>
      </div>

      {!allRated && (
        <p className="text-center text-xs text-muted-foreground">
          Debes calificar todas las películas para continuar
        </p>
      )}
    </div>
  );
}

