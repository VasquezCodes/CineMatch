import { Skeleton } from "@/components/ui/skeleton";

export function FastRankingSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="sticky top-14 z-30 space-y-4 bg-background/95 backdrop-blur-md pb-6 pt-4 -mx-4 px-4 border-b border-border" data-theme-transition>
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="flex p-1 bg-muted rounded-lg border border-border">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto w-full">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card"
          >
            <Skeleton className="h-16 w-11 shrink-0 rounded-md" />
            <div className="flex flex-1 flex-col justify-center gap-2 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-8" />
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 10 }).map((_, j) => (
                  <Skeleton key={j} className="h-7 w-7 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
