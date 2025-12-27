"use client";

import * as React from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateMovieRating } from "../actions";
import type { UnratedMovie } from "../types";

interface MovieRatingCardProps {
  movie: UnratedMovie;
  onRated: (watchlistId: string, rating: number) => void;
  className?: string;
}

export function MovieRatingCard({
  movie,
  onRated,
  className,
}: MovieRatingCardProps) {
  const [rating, setRating] = React.useState<number>(movie.currentRating || 0);
  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [isSaving, setIsSaving] = React.useState(false);
  const hasChanges = rating !== (movie.currentRating || 0);

  const handleSave = async () => {
    if (rating === 0) {
      toast.error("Seleccioná al menos 1 estrella");
      return;
    }

    setIsSaving(true);
    const result = await updateMovieRating(movie.watchlistId, rating);

    if (result.success) {
      toast.success(`${movie.title} calificada con ${rating}/10`);
      onRated(movie.watchlistId, rating);
    } else {
      toast.error(result.error || "Error al guardar la calificación");
    }

    setIsSaving(false);
  };

  const displayRating = hoverRating || rating;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="relative w-20 h-28 shrink-0 rounded-md overflow-hidden bg-muted">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Star className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Info y Rating */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Título y año */}
            <div>
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                {movie.title}
              </h3>
              {movie.year && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {movie.year}
                </p>
              )}
            </div>

            {/* Estrellas de rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs text-muted-foreground">
                  Calificación
                </label>
                <span className="text-sm font-medium tabular-nums text-primary">
                  {displayRating > 0 ? `${displayRating}/10` : "Sin calificar"}
                </span>
              </div>

              {/* Grid de estrellas */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                  const isActive = star <= displayRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={isSaving}
                      className={cn(
                        "p-0 transition-all duration-150",
                        "hover:scale-110 active:scale-95",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                      )}
                      aria-label={`Calificar con ${star} estrellas`}
                    >
                      <Star
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Botón guardar */}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || rating === 0 || isSaving}
                className="w-full"
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

