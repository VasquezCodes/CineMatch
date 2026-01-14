"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";
import type { AnalysisData } from "@/features/insights/actions";

interface AnalysisStatsProps {
  data: AnalysisData;
}

export function AnalysisStats({ data }: AnalysisStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Películas</CardTitle>
          <Film className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalMovies}</div>
          <p className="text-xs text-muted-foreground">En tu biblioteca</p>
        </CardContent>
      </Card>
    </div>
  );
}
