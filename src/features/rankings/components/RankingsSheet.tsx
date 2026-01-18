"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "@/components/CloudinaryImage";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getRanking, type RankingType, type RankingStatConfig } from "@/features/rankings/actions";
import { ErrorState } from "@/components/ui/error-state";
import { TrendingUp, X, Star } from "lucide-react";

interface RankingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  rankingType: RankingType;
  rankingLabel: string;
}

export function RankingsSheet({
  open,
  onOpenChange,
  userId,
  rankingType,
  rankingLabel,
}: RankingsSheetProps) {
  const router = useRouter();
  const [data, setData] = React.useState<RankingStatConfig[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Solo mostrar avatar para directores y actores
  const showAvatar = rankingType === "director" || rankingType === "actor";

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
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/w185${path}`;
  };

  React.useEffect(() => {
    if (!open) return;

    const loadFullRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getRanking(userId, rankingType, {
          minRating: 1,
          limit: 20, // Aumentamos el límite para el drawer
        });
        setData(result);
      } catch (err) {
        console.error("Error loading full ranking:", err);
        setError("Error al cargar el ranking completo");
      } finally {
        setLoading(false);
      }
    };

    loadFullRanking();
  }, [open, userId, rankingType]);

  // Cálculos para Quick Stats
  const allMovies = React.useMemo(() => {
    const movies = data.flatMap((item) => item.data.movies || []);
    // Eliminar duplicados por ID
    return Array.from(new Map(movies.map((m) => [m.id, m])).values());
  }, [data]);

  const totalMovies = allMovies.length;
  const avgRating =
    totalMovies > 0
      ? allMovies.reduce((acc, m) => acc + (m.user_rating || 0), 0) / totalMovies
      : 0;

  const handleMovieClick = (movie: (typeof allMovies)[0]) => {
    router.push(`/app/movies/${movie.id}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl bg-background border-l border-border p-0 flex flex-col h-full gap-0"
      >
        {/* Título oculto para accesibilidad */}
        <SheetTitle className="sr-only">
          Ranking completo: {rankingLabel}
        </SheetTitle>

        {/* Header Fijo */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 p-6 pb-4 transition-[background-color,border-color] duration-200" data-theme-transition>
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground leading-none">
                {rankingLabel}
              </h2>
              <p className="text-muted-foreground text-sm font-medium">
                Top del ranking basado en tus calificaciones
              </p>
            </div>
            <SheetClose className="rounded-full h-8 w-8 flex items-center justify-center bg-card/20 backdrop-blur-md border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/30 hover:border-border/60 transition-all duration-200 focus:outline-none">
              <X className="h-4 w-4" />
            </SheetClose>
          </div>

          {/* Quick Stats (Bento Style) */}
          <div className="grid grid-cols-2 gap-px bg-border border border-border/40 rounded-xl overflow-hidden shadow-2xl" data-theme-transition>
            <div className="bg-card/20 backdrop-blur-xl p-4 flex flex-col items-center justify-center group transition-colors hover:bg-card/30" data-theme-transition>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">
                Total Películas
              </span>
              <span className="text-2xl font-black text-foreground group-hover:scale-110 transition-transform">
                {loading ? "..." : totalMovies}
              </span>
            </div>
            <div className="bg-card/20 backdrop-blur-xl p-4 flex flex-col items-center justify-center group transition-colors hover:bg-card/30" data-theme-transition>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">
                Promedio Rating
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-primary group-hover:scale-110 transition-transform">
                  {loading ? "..." : avgRating.toFixed(1)}
                </span>
                <Star className="h-4 w-4 fill-primary text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
          {loading ? (
            <SheetSkeleton />
          ) : error ? (
            <div className="py-12">
              <ErrorState title="Error" description={error} />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                No hay datos disponibles en este ranking
              </p>
            </div>
          ) : (
            data.map((item, index) => (
              <div key={item.key} className="space-y-4">
                {/* Item Header */}
                <div className="flex items-end justify-between border-b border-border pb-2" data-theme-transition>
                  <div className="flex items-center gap-3">
                    {/* Avatar del director/actor - Solo para directores y actores */}
                    {showAvatar && (
                      <Avatar className="h-10 w-10 ring-2 ring-border/40">
                        {item.data.image_url && getImageUrl(item.data.image_url) ? (
                          <AvatarImage
                            src={getImageUrl(item.data.image_url)!}
                            alt={item.key}
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(item.key)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-4xl font-black text-foreground/10 select-none">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {item.key}
                      </h3>
                      {item.data.roles && item.data.roles.length > 0 && (
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {item.data.roles.map((r) => `${r.role} (${r.movies.join(' • ')})`).join(" • ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-card/20 backdrop-blur-md hover:bg-card/30 text-muted-foreground border-border/40 text-[10px] px-2 py-0 transition-all duration-200" data-theme-transition>
                    {item.count} títulos
                  </Badge>
                </div>

                {/* Movie List (Vertical Compact) */}
                <div className="space-y-2">
                  {(item.data.movies || []).map((movie: any) => (
                    <div
                      key={movie.id}
                      className="group/movie flex items-center gap-4 p-2 rounded-lg bg-card/10 backdrop-blur-md hover:bg-card/20 transition-all cursor-pointer border border-border/30 hover:border-border/50"
                      data-theme-transition
                      onClick={() => handleMovieClick(movie)}
                    >
                      {/* Thumbnail 2:3 */}
                      <div className="relative aspect-[2/3] w-12 flex-shrink-0 overflow-hidden rounded-md bg-card/20 backdrop-blur-md border border-border/40 group-hover/movie:border-primary/50 group-hover/movie:bg-card/30 transition-[border-color,background-color] duration-200" data-theme-transition>
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

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground group-hover/movie:text-primary transition-colors truncate">
                          {movie.title}
                        </h4>
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

                      {/* Rating */}
                      {movie.user_rating && (
                        <div className="flex items-center gap-1 shrink-0 bg-accent/5 px-2 py-1 rounded border border-accent/10" data-theme-transition>
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
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SheetSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-end justify-between border-b border-border pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-4 p-2">
                <Skeleton className="aspect-[2/3] w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
