"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/CloudinaryImage";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Star } from "lucide-react";
import type { RankingStatConfig, RankingType } from "../actions";
import { calculateItemAverageRating } from "../hooks/useRankingCalculations";

interface RankingItemMoviesProps {
  item: RankingStatConfig;
  index: number;
  type: RankingType;
  onBack: () => void;
}

export function RankingItemMovies({
  item,
  index,
  type,
  onBack,
}: RankingItemMoviesProps) {
  const router = useRouter();
  const showAvatar = type === "director" || type === "actor";
  const avgRating = calculateItemAverageRating(item);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((word) => word.length > 0)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/w185${path}`;
  };

  const handleMovieClick = (movie: any) => {
    router.push(`/app/movies/${movie.id}`);
  };

  return (
    <div className="space-y-6 border border-border/40 rounded-xl bg-card/20 backdrop-blur-xl p-6 transition-[background-color,border-color] duration-200">
      {/* Botón Volver */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 -ml-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a gráficos
      </Button>

      {/* Header del Item */}
      <div className="flex items-end justify-between border-b border-border pb-4" data-theme-transition>
        <div className="flex items-center gap-3">
          {showAvatar && (
            <Avatar className="h-12 w-12 ring-2 ring-border/40">
              {item.data.image_url && getImageUrl(item.data.image_url) ? (
                <AvatarImage
                  src={getImageUrl(item.data.image_url)!}
                  alt={item.key}
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {getInitials(item.key)}
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={
              index === 0
                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-500"
                : index === 1
                  ? "bg-slate-400/20 text-slate-600 dark:text-slate-400"
                  : index === 2
                    ? "bg-amber-600/20 text-amber-700 dark:text-amber-600"
                    : "bg-muted text-muted-foreground"
            }
            style={{
              fontSize: "2.5rem",
              fontWeight: 900,
              lineHeight: 1,
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
            }}
          >
            #{index + 1}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground leading-tight">
              {item.key}
            </h3>
            {item.data.roles && item.data.roles.length > 0 && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                {item.data.roles.map((r: any) => `${r.role} (${r.movies.join(' • ')})`).join(" • ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 text-sm font-semibold text-star-yellow">
            <Star className="h-4 w-4 fill-current" />
            {avgRating}
          </div>
        </div>
      </div>

      {/* Lista de Películas */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Películas ({item.data.movies?.length || 0})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(item.data.movies || []).map((movie: any) => (
            <div
              key={movie.id}
              className="group/movie flex flex-col gap-2 cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-card/20 backdrop-blur-xl border border-border/40 group-hover/movie:border-primary/50 group-hover/movie:bg-card/30 transition-[border-color,background-color] duration-200" data-theme-transition>
                {movie.poster_url ? (
                  <Image
                    src={movie.poster_url}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/movie:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground uppercase font-bold">
                    N/A
                  </div>
                )}
                {/* Rating overlay */}
                {movie.user_rating && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded border border-star-yellow/30">
                    <Star className="h-2.5 w-2.5 fill-star-yellow text-star-yellow" />
                    <span className="text-xs font-black text-star-yellow">
                      {movie.user_rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-foreground group-hover/movie:text-primary transition-colors line-clamp-2">
                  {movie.title}
                </h5>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {movie.year}
                  </span>
                  {movie.is_saga && (
                    <span className="text-[8px] px-1 bg-primary/10 text-primary border border-primary/20 rounded-sm uppercase font-bold tracking-tighter">
                      Saga
                    </span>
                  )}
                </div>
                {type !== "director" && movie.director_name && (
                  <p className="text-xs text-muted-foreground/70 truncate">
                    {movie.director_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
