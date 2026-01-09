import { PersonHeaderSkeleton } from '@/features/person';
import { Skeleton } from '@/components/ui/skeleton';

export default function PersonLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Botón Volver Skeleton */}
        <div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Header Skeleton */}
        <PersonHeaderSkeleton />

        {/* Filmografía Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          
          {/* Tabs Skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
