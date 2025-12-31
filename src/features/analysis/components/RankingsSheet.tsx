"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRanking, type RankingType } from "@/features/rankings/actions";
import { ErrorState } from "@/components/ui/error-state";
import { TrendingUp } from "lucide-react";

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
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const loadFullRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getRanking(userId, rankingType, {
          minRating: 1,
          limit: 10,
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Top 10: {rankingLabel}</SheetTitle>
          <SheetDescription>
            Ranking completo basado en tus calificaciones
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <SheetSkeleton />
          ) : error ? (
            <ErrorState title="Error" description={error} />
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay datos disponibles
              </p>
            </div>
          ) : (
            data.map((item, index) => (
              <Card key={item.name} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h3 className="font-bold text-lg mt-1">{item.name}</h3>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {item.count} {item.count === 1 ? "película" : "películas"}
                    </Badge>
                  </div>

                  {/* Metadatos de actores */}
                  {item.roles && item.roles.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Roles:</span>{" "}
                      {item.roles.join(", ")}
                      {item.is_saga && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-[10px] px-1.5 py-0.5"
                        >
                          Saga / Recurrente
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Grid de películas */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {item.movies.map((movie: any) => (
                      <div
                        key={movie.id}
                        className="text-center group cursor-pointer"
                      >
                        <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden bg-muted mb-2 group-hover:ring-2 group-hover:ring-primary transition-all">
                          {movie.poster_url ? (
                            <Image
                              src={movie.poster_url}
                              alt={movie.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <span className="text-xs">Sin poster</span>
                            </div>
                          )}
                        </div>

                        <div
                          className="text-xs font-medium line-clamp-2 mb-1"
                          title={movie.title}
                        >
                          {movie.title}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {movie.year}
                        </div>

                        {movie.user_rating && (
                          <div className="text-xs font-bold text-amber-500 mt-1">
                            ★ {movie.user_rating}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SheetSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-4 w-8 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <Skeleton className="w-full aspect-[2/3] rounded-md mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

