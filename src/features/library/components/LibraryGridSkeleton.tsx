import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LibraryGridSkeleton
 * Estado de carga para la biblioteca.
 */
export function LibraryGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filtros skeleton */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[160px]" />
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>
      </Card>

      {/* Contador skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Grid skeleton - matching MovieCard dimensions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-border/40 shadow-sm">
            <div className="flex h-52 sm:h-48">
              {/* Poster skeleton */}
              <Skeleton className="w-28 sm:w-32 h-full shrink-0 rounded-none bg-muted" />

              <div className="flex-1 flex flex-col p-4 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-8" /> {/* Rating */}
                    <Skeleton className="h-3 w-10" /> {/* Year */}
                  </div>
                  <Skeleton className="h-7 w-7 rounded-md" /> {/* Info button */}
                </div>

                <Skeleton className="h-4 w-[80%] mb-2" /> {/* Title */}

                <div className="space-y-1.5 mb-2">
                  <Skeleton className="h-3 w-full" /> {/* Overview line 1 */}
                  <Skeleton className="h-3 w-[90%]" /> {/* Overview line 2 */}
                </div>

                <div className="flex gap-1 mb-2">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>

                <div className="mt-auto pt-3">
                  <Skeleton className="h-8 w-full rounded-md" /> {/* Cualificar button */}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Paginación skeleton */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-1">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
