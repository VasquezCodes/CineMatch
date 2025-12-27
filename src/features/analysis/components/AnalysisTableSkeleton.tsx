import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieCardSkeleton } from "./MovieCardSkeleton";

export function AnalysisTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filtros skeleton */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Búsqueda skeleton */}
          <div className="relative flex-1 max-w-md">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Selects skeleton */}
          <div className="flex gap-2 items-center">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 w-[160px] rounded-md" />
            <Skeleton className="h-10 w-[140px] rounded-md" />
          </div>
        </div>
      </Card>

      {/* Contador skeleton */}
      <Skeleton className="h-4 w-48" />

      {/* Grid de películas skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

