"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RankingsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 shrink-0" />
        ))}
      </div>

      {/* Cards Skeleton */}
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
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="shrink-0">
                    <Skeleton className="w-24 h-36 rounded-md mb-2" />
                    <Skeleton className="h-3 w-20 mx-auto mb-1" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

