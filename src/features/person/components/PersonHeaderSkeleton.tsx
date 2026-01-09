import { Skeleton } from '@/components/ui/skeleton';

export function PersonHeaderSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-8 pb-8 border-b border-border/50">
      {/* Foto Skeleton */}
      <div className="w-full max-w-[280px] md:max-w-none mx-auto md:mx-0">
        <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      </div>

      {/* Contenido Skeleton */}
      <div className="flex flex-col space-y-4">
        <div>
          <Skeleton className="h-10 w-3/4 mb-3" />
          <Skeleton className="h-6 w-32" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>

        <div className="pt-4 space-y-2">
          <Skeleton className="h-6 w-32 mb-3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}
