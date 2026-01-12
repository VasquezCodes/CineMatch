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
        "group relative flex items-center gap-4 p-3 rounded-xl border transition-[background-color,border-color,box-shadow,opacity] duration-200",
        "bg-card border-border hover:shadow-md hover:border-primary/30",
        isRated &&
        "border-primary/40 bg-primary/2 dark:bg-primary/5 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.15)]",
        isSaving && "opacity-70 pointer-events-none"
      )}
      data-theme-transition
    >
      {/* Poster */}
      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-muted border border-border/50 shadow-sm">
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
              "font-semibold text-sm truncate tracking-tight",
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
                "h-7 w-7 rounded-md text-[11px] font-bold transition-[background-color,border-color,color,transform,box-shadow] duration-200 flex items-center justify-center border",
                "focus:ring-2 focus:ring-primary/20 outline-none",
                currentRating === num
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/3"
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
