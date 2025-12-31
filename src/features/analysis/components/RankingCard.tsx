"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { RankingItem } from "@/features/rankings/actions";

interface RankingCardProps {
  item: RankingItem;
  index: number;
  onViewMore?: () => void;
  compact?: boolean;
}

export function RankingCard({
  item,
  index,
  onViewMore,
  compact = false,
}: RankingCardProps) {
  // En modo compacto mostramos menos películas
  const moviesToShow = compact ? item.movies.slice(0, 3) : item.movies;
  const hasMore = item.movies.length > moviesToShow.length;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-4 transition-[background-color,box-shadow] duration-200 hover:bg-card/50 hover:shadow-sm" data-theme-transition>
      {/* Background decoration for the rank - optional but adds to Vercel/Linear aesthetic */}
      <div className="absolute -right-4 -top-8 text-8xl font-black text-foreground/3 select-none pointer-events-none">
        {index + 1}
      </div>

      <div className="relative mb-4 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {index + 1}
            </span>
            <h3
              className="font-semibold text-sm md:text-base truncate"
              title={item.name}
            >
              {item.name}
            </h3>
          </div>

          {/* Roles for actors */}
          {item.roles && item.roles.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground line-clamp-1">
                {item.roles.slice(0, 2).join(", ")}
                {item.roles.length > 2 && ` +${item.roles.length - 2}`}
              </span>
              {item.is_saga && (
                <Badge
                  variant="outline"
                  className="h-4 text-[8px] px-1 bg-primary/5 text-primary/60 border-primary/20 uppercase tracking-tighter"
                >
                  Saga
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            Total
          </span>
          <span className="text-lg font-bold leading-none text-foreground/80">
            {item.count}
          </span>
        </div>
      </div>

      {/* Lista de películas con flex-wrap */}
      <div className="flex flex-wrap gap-3">
        {moviesToShow.map((movie) => (
          <div
            key={movie.id}
            className="group/movie flex w-[84px] md:w-[96px] flex-col gap-1.5 cursor-pointer"
          >
            {/* Poster Sub-card */}
            <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-muted shadow-sm transition-[transform,box-shadow] duration-300 group-hover/movie:scale-[1.03] group-hover/movie:ring-2 group-hover/movie:ring-primary/40">
              {movie.poster_url ? (
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/movie:scale-110"
                  sizes="(max-width: 768px) 84px, 96px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                  <span className="text-[10px]">N/A</span>
                </div>
              )}

              {/* Rating overlay minimalista */}
              {movie.user_rating && (
                <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md bg-background/80 backdrop-blur-sm text-[10px] font-bold text-primary shadow-sm border border-primary/20">
                  {movie.user_rating}
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="space-y-0.5 px-0.5">
              <p
                className="text-[10px] md:text-[11px] font-medium leading-tight line-clamp-1 group-hover/movie:text-primary transition-colors duration-200"
                title={movie.title}
              >
                {movie.title}
              </p>
              <p className="text-[9px] md:text-[10px] text-muted-foreground">
                {movie.year}
              </p>
            </div>
          </div>
        ))}

        {/* Botón Ver Más minimalista */}
        {hasMore && onViewMore && (
          <button
            onClick={onViewMore}
            className="flex w-[84px] md:w-[96px] aspect-2/3 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 text-muted-foreground transition-colors duration-200 hover:bg-muted/40 hover:text-foreground group/more"
          >
            <ArrowRight className="h-5 w-5 mb-1 transition-transform group-hover/more:translate-x-1" />
            <span className="text-[10px] font-medium">
              +{item.movies.length - moviesToShow.length} más
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
