"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/CloudinaryImage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Film } from "lucide-react";
import type { RankingStatConfig, RankingType } from "../actions";
import { RankingDetailList } from "./RankingDetailList";
import { cn } from "@/lib/utils";

interface RankingsDetailPanelProps {
  data: RankingStatConfig[];
  type: RankingType;
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
  isLoading: boolean;
  isMobile?: boolean;
}

const TYPE_LABELS: Record<RankingType, string> = {
  director: "Directores",
  actor: "Actores",
  genre: "Géneros",
  year: "Años",
  screenplay: "Guionistas",
  photography: "Fotografía",
  music: "Música",
};

const PERSON_TYPES: RankingType[] = ["director", "actor", "screenplay", "photography", "music"];

export function RankingsDetailPanel({
  data,
  type,
  selectedIndex,
  onSelectItem,
  isLoading,
  isMobile = false,
}: RankingsDetailPanelProps) {
  const router = useRouter();
  const isPerson = React.useMemo(() => PERSON_TYPES.includes(type), [type]);

  const { allMovies, totalMovies, avgRating } = React.useMemo(() => {
    const movies = data.flatMap((item) => item.data.movies || []);
    const uniqueMovies = Array.from(new Map(movies.map((m) => [m.id, m])).values());
    const total = uniqueMovies.length;
    const rating = total > 0
      ? uniqueMovies.reduce((acc, m) => acc + (m.user_rating || 0), 0) / total
      : 0;

    return {
      allMovies: uniqueMovies,
      totalMovies: total,
      avgRating: rating,
    };
  }, [data]);

  const selectedItem = React.useMemo(
    () => (selectedIndex !== null ? data[selectedIndex] : null),
    [selectedIndex, data]
  );

  const getInitials = React.useCallback((name: string) => {
    return name
      .split(" ")
      .filter((word) => word.length > 0)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  }, []);

  const getImageUrl = React.useCallback((path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/w185${path}`;
  }, []);

  const handleMovieClick = React.useCallback((movie: any) => {
    router.push(`/app/movies/${movie.id}`);
  }, [router]);

  if (isLoading) {
    return <DetailPanelSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center h-full py-8 px-4 text-center",
        !isMobile && "border-l border-border/50"
      )}>
        <Film className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay datos de {TYPE_LABELS[type].toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-full",
      !isMobile && "border-l border-border/50"
    )}>
      {/* Header con estadísticas generales */}
      <div className={cn(
        "border-b border-border/50 p-4 md:p-6 space-y-4",
        !isMobile && "bg-card/10 backdrop-blur-xl"
      )}>
        <div>
          <h3 className="text-xl font-bold text-foreground">
            Detalles y Películas
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Top 10 basado en tus calificaciones
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card/20 backdrop-blur-xl p-4 rounded-lg border border-border/40 transition-colors hover:bg-card/30">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold block mb-1">
              Total Películas
            </span>
            <span className="text-2xl font-black text-foreground">
              {totalMovies}
            </span>
          </div>
          <div className="bg-card/20 backdrop-blur-xl p-4 rounded-lg border border-border/40 transition-colors hover:bg-card/30">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold block mb-1">
              Promedio Rating
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary">
                {avgRating.toFixed(1)}
              </span>
              <Star className="h-4 w-4 fill-primary text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista scrolleable */}
      <ScrollArea className={cn(
        "flex-1",
        !isMobile && "max-h-[calc(100vh-400px)]"
      )}>
        <div className="p-4 space-y-6">
          {/* Top 10 List */}
          <RankingDetailList
            data={data.slice(0, 10)}
            type={type}
            selectedIndex={selectedIndex}
            onSelectItem={onSelectItem}
          />

          {/* Películas del item seleccionado */}
          {selectedItem && (
            <div className="space-y-4 border-t border-border/50 pt-6">
              <div className="flex items-end justify-between pb-3 border-b border-border/30">
                <div className="flex items-center gap-3">
                  {isPerson && (
                    <Avatar className="h-10 w-10 ring-2 ring-border/40">
                      {selectedItem.data.image_url && getImageUrl(selectedItem.data.image_url) ? (
                        <AvatarImage
                          src={getImageUrl(selectedItem.data.image_url)!}
                          alt={selectedItem.key}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getInitials(selectedItem.key)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "text-3xl font-black select-none",
                      selectedIndex === 0 && "text-yellow-600 dark:text-yellow-500",
                      selectedIndex === 1 && "text-slate-600 dark:text-slate-400",
                      selectedIndex === 2 && "text-amber-700 dark:text-amber-600",
                      selectedIndex !== null && selectedIndex > 2 && "text-muted-foreground"
                    )}
                  >
                    {String((selectedIndex || 0) + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground leading-tight">
                      {selectedItem.key}
                    </h4>
                    {selectedItem.data.roles && selectedItem.data.roles.length > 0 && (
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {selectedItem.data.roles.map((r: any) => `${r.role} (${r.movies.join(' • ')})`).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  {selectedItem.count} títulos
                </div>
              </div>

              {/* Grid de películas */}
              <div className="space-y-2">
                {(selectedItem.data.movies || []).map((movie: any) => (
                  <div
                    key={movie.id}
                    className="group/movie flex items-center gap-3 p-2 rounded-lg bg-card/10 backdrop-blur-md hover:bg-card/20 transition-all cursor-pointer border border-border/30 hover:border-border/50"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <div className="relative aspect-[2/3] w-12 flex-shrink-0 overflow-hidden rounded-md bg-card/20 backdrop-blur-md border border-border/40 group-hover/movie:border-primary/50 transition-colors">
                      {movie.poster_url ? (
                        <Image
                          src={movie.poster_url}
                          alt={movie.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover/movie:scale-110"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground uppercase font-bold">
                          N/A
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-foreground group-hover/movie:text-primary transition-colors truncate">
                        {movie.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {movie.year}
                        </span>
                        {movie.is_saga && (
                          <span className="text-[8px] px-1 bg-primary/10 text-primary border border-primary/20 rounded-sm uppercase font-bold tracking-tighter">
                            Saga
                          </span>
                        )}
                      </div>
                    </div>

                    {movie.user_rating && (
                      <div className="flex items-center gap-1 shrink-0 bg-accent/5 px-2 py-1 rounded border border-accent/10">
                        <span className="text-xs font-black text-accent">
                          {movie.user_rating}
                        </span>
                        <Star className="h-2.5 w-2.5 fill-accent text-accent" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

const DetailPanelSkeleton = React.memo(function DetailPanelSkeleton() {
  const { Skeleton } = require("@/components/ui/skeleton");

  return (
    <div className="flex flex-col h-full border-l border-border/50">
      <div className="border-b border-border/50 p-6 space-y-4">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
});
