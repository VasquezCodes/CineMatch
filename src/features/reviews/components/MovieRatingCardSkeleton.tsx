import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MovieRatingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Poster skeleton */}
          <Skeleton className="w-20 h-28 shrink-0 rounded-md" />

          {/* Info y Rating skeleton */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Título y año */}
            <div>
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-16 mt-0.5" />
            </div>

            {/* Calificación skeleton */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>

              {/* Grid de estrellas skeleton */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} className="h-5 w-5 rounded" />
                ))}
              </div>

              {/* Botón guardar skeleton */}
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

