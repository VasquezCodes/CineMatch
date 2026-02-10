"use client";

import * as React from "react";
import Image from "@/components/CloudinaryImage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateMovieRating } from "../actions";
import type { UnratedMovie } from "../types";

interface FastMovieCardProps {
  movie: UnratedMovie;
  onRated: (watchlistId: string, rating: number) => void;
}

export function FastMovieCard({ movie, onRated }: FastMovieCardProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [currentRating, setCurrentRating] = React.useState<number | null>(
    movie.currentRating
  );
  const isRated = currentRating !== null;

  const handleRate = async (rating: number) => {
    if (isSaving) return;

    const previousRating = currentRating;
    setCurrentRating(rating);
    setIsSaving(true);

    try {
      const result = await updateMovieRating(movie.watchlistId, rating);
      if (result.success) {
        toast.success(`${movie.title}: ${rating}/10`);
        onRated(movie.watchlistId, rating);
      } else {
        toast.error("Error al calificar");
        setCurrentRating(previousRating);
      }
    } catch (error) {
      toast.error("Error de red");
      setCurrentRating(previousRating);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
        "backdrop-blur-md bg-card/90 ring-1 ring-border/40 border-0",
        "shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10 hover:ring-primary/30",
        isRated &&
        "ring-primary/40 bg-primary/5 shadow-lg shadow-primary/10",
        isSaving && "opacity-70 pointer-events-none"
      )}
      data-theme-transition
    >
      {/* Poster */}
      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/30 shadow-md shadow-black/10">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="44px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[8px] text-muted-foreground font-bold">
            N/A
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={cn(
              "font-semibold text-sm truncate tracking-tight [text-shadow:_0_1px_2px_rgb(0_0_0_/_8%)]",
              isRated ? "text-primary" : "text-foreground"
            )}
          >
            {movie.title}
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
            {movie.year}
          </span>
        </div>

        {/* Rating Buttons */}
        <div className="flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => handleRate(num)}
              disabled={isSaving}
              className={cn(
                "h-7 w-7 rounded-md text-[11px] font-bold transition-all duration-200 flex items-center justify-center",
                "focus:ring-2 focus:ring-primary/20 outline-none",
                currentRating === num
                  ? "bg-primary text-primary-foreground ring-1 ring-primary shadow-md shadow-primary/20 scale-105"
                  : "backdrop-blur-sm bg-background/80 text-muted-foreground ring-1 ring-border/40 hover:ring-primary/50 hover:text-primary hover:bg-primary/5 hover:shadow-sm"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
