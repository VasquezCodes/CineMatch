"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "@/components/CloudinaryImage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type {
  RankingStatConfig,
  RankingType,
} from "@/features/rankings/actions";

interface RankingCardProps {
  item: RankingStatConfig;
  index: number;
  type?: RankingType;
  onViewMore?: () => void;
  compact?: boolean;
}

export function RankingCard({
  item,
  index,
  type,
  onViewMore,
  compact = false,
}: RankingCardProps) {
  const router = useRouter();

  const handleMovieClick = (movie: (typeof item.data.movies)[0]) => {
    // Construir URL con query params para pasar datos temporalmente
    const params = new URLSearchParams({
      title: movie.title,
      year: movie.year.toString(),
      ...(movie.poster_url && { poster: encodeURIComponent(movie.poster_url) }),
      ...(movie.user_rating && { rating: movie.user_rating.toString() }),
    });

    router.push(`/app/movies/${movie.id}?${params.toString()}`);
  };
  // En modo compacto mostramos menos películas
  const movies = item.data?.movies || [];
  const moviesToShow = compact ? movies.slice(0, 3) : movies;
  const hasMore = movies.length > moviesToShow.length;

  // Mostrar avatar para personas (director, actor, guionista, fotografía, música)
  const showAvatar =
    type === "director" ||
    type === "actor" ||
    type === "screenplay" ||
    type === "photography" ||
    type === "music";

  // Helper para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter((word) => word.length > 0)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  // Helper para formatear URL de imagen de TMDb
  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    // Si ya tiene el dominio completo, devolverla tal cual
    if (path.startsWith("http")) return path;
    // Si es una ruta relativa, construir la URL completa
    return `https://image.tmdb.org/t/p/w185${path}`;
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/20 backdrop-blur-xl p-4 transition-[background-color,box-shadow,border-color] duration-200 hover:bg-card/30 hover:border-border/60 hover:shadow-lg hover:shadow-primary/5"
      data-theme-transition
    >
      {/* Background decoration for the rank - optional but adds to Vercel/Linear aesthetic */}
      <div className="absolute -right-4 -top-8 text-8xl font-black text-foreground/3 select-none pointer-events-none">
        {index + 1}
      </div>

      <div className="relative mb-4 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Avatar del director/actor - Solo para directores y actores */}
            {showAvatar && (
              <Avatar className="h-8 w-8 ring-1 ring-border/40 transition-transform duration-200 group-hover:scale-105">
                {item.data.image_url && getImageUrl(item.data.image_url) ? (
                  <AvatarImage
                    src={getImageUrl(item.data.image_url)!}
                    alt={item.key}
                  />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                  {getInitials(item.key)}
                </AvatarFallback>
              </Avatar>
            )}

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {index + 1}
            </span>
            {showAvatar ? (
              <Link
                href={`/person/${encodeURIComponent(item.key)}`}
                className="relative inline-block font-semibold text-sm md:text-base truncate after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-foreground after:w-0 hover:after:w-full after:transition-all after:duration-300 after:ease-in-out"
                title={item.key}
              >
                {item.key}
              </Link>
            ) : (
              <h3
                className="font-semibold text-sm md:text-base truncate"
                title={item.key}
              >
                {item.key}
              </h3>
            )}
          </div>

          {/* Roles for actors */}
          {item.data.roles && item.data.roles.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground line-clamp-1">
                {item.data.roles
                  .slice(0, 2)
                  .map((r) => `${r.role} (${r.movies.join(", ")})`)
                  .join(", ")}
                {item.data.roles.length > 2 &&
                  ` +${item.data.roles.length - 2}`}
              </span>
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
            onClick={() => handleMovieClick(movie)}
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
                <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md bg-background/80 backdrop-blur-sm text-[10px] font-bold text-accent shadow-sm border border-accent/20">
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
              +{movies.length - moviesToShow.length} más
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
