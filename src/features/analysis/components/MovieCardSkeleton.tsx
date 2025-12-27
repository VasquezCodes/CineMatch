import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-4">
        {/* Poster skeleton */}
        <Skeleton className="w-20 h-28 shrink-0 rounded-md" />

        {/* Info skeleton */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Título */}
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />

          {/* Año */}
          <Skeleton className="h-3 w-16" />

          {/* Director */}
          <Skeleton className="h-3 w-2/3" />

          {/* Rating */}
          <div className="flex items-center gap-1 pt-1">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-3 w-8" />
          </div>

          {/* IMDb Rating */}
          <Skeleton className="h-3 w-20" />

          {/* Géneros */}
          <div className="flex flex-wrap gap-1 pt-1">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

