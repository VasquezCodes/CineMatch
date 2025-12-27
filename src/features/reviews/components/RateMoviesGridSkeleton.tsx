import { Skeleton } from "@/components/ui/skeleton";
import { MovieRatingCardSkeleton } from "./MovieRatingCardSkeleton";

export function RateMoviesGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header con progreso skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Grid de películas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <MovieRatingCardSkeleton key={index} />
        ))}
      </div>

      {/* Botón continuar skeleton */}
      <div className="flex justify-center pt-4">
        <Skeleton className="h-11 w-[200px] rounded-md" />
      </div>

      {/* Texto informativo skeleton */}
      <Skeleton className="h-3 w-64 mx-auto" />
    </div>
  );
}

