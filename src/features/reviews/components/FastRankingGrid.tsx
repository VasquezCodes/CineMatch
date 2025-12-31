"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FastMovieCard } from "./FastMovieCard";
import type { UnratedMovie } from "../types";
import { cn } from "@/lib/utils";

interface FastRankingGridProps {
  movies: UnratedMovie[];
}

type FilterStatus = "pendientes" | "calificados" | "todos";

export function FastRankingGrid({ movies }: FastRankingGridProps) {
  const [filter, setFilter] = React.useState<FilterStatus>("pendientes");
  const [ratedMap, setRatedMap] = React.useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    movies.forEach((m) => {
      if (m.currentRating !== null) {
        initialMap[m.watchlistId] = m.currentRating;
      }
    });
    return initialMap;
  });

  const handleMovieRated = (watchlistId: string, rating: number) => {
    setRatedMap((prev) => ({
      ...prev,
      [watchlistId]: rating,
    }));
  };

  const totalMovies = movies.length;
  const ratedCount = Object.keys(ratedMap).length;
  const progressPercent =
    totalMovies > 0 ? (ratedCount / totalMovies) * 100 : 0;

  const filteredMovies = movies.filter((movie) => {
    const isRated = ratedMap[movie.watchlistId] !== undefined;
    if (filter === "pendientes") return !isRated;
    if (filter === "calificados") return isRated;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Progress Bar Persistente */}
      <div className="sticky top-14 z-30 space-y-4 bg-background/95 backdrop-blur-md pb-6 pt-4 -mx-4 px-4 border-b border-border" data-theme-transition>
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Progreso de Calificación
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                {Math.round(progressPercent)}%
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                ({ratedCount} de {totalMovies})
              </span>
            </div>
          </div>

          {/* Filtros de Estado */}
          <div className="flex p-1 bg-muted rounded-lg border border-border">
            {(["pendientes", "calificados", "todos"] as FilterStatus[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-semibold transition-colors duration-200 capitalize",
                    filter === f
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              )
            )}
          </div>
        </div>
        <div className="max-w-5xl mx-auto w-full">
          <Progress
            value={progressPercent}
            className="h-2 bg-muted overflow-hidden rounded-full border border-border/50"
            indicatorClassName="bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
          />
        </div>
      </div>

      {/* Grid de Películas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto w-full">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <FastMovieCard
              key={movie.watchlistId}
              movie={{
                ...movie,
                currentRating: ratedMap[movie.watchlistId] ?? null,
              }}
              onRated={handleMovieRated}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground text-sm">
              No hay películas en esta categoría.
            </p>
          </div>
        )}
      </div>

      {/* CTA final cuando termina */}
      {ratedCount === totalMovies && (
        <div className="flex justify-center pt-8 pb-12">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 h-auto text-lg font-bold rounded-2xl shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all hover:scale-105"
            onClick={() => (window.location.href = "/app/analysis")}
          >
            Ver Mi Análisis Completo
          </Button>
        </div>
      )}
    </div>
  );
}
