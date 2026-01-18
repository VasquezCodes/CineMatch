"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function RankingsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 p-4 bg-card/20 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-32 md:w-48" />
            </div>
            <div className="flex flex-col items-end">
              <Skeleton className="h-3 w-8 mb-1" />
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="w-[84px] md:w-[96px] space-y-2">
                <Skeleton className="aspect-2/3 w-full rounded-lg" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-2 w-2/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
