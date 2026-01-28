"use client";

import * as React from "react";
import { RankingChartSection } from "./RankingChartSection";
import { RankingStatsGrid } from "./RankingStatsGrid";
import type { ChartType } from "./charts";
import type { RankingStatConfig, RankingType } from "../actions";
import { useRankingCalculations } from "../hooks/useRankingCalculations";

interface RankingsGraphicsPanelProps {
  data: RankingStatConfig[];
  type: RankingType;
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
  isLoading: boolean;
}

const TYPE_LABELS: Record<RankingType, string> = {
  director: "Directores",
  actor: "Actores",
  genre: "Géneros",
  year: "Años",
  screenplay: "Guionistas",
  photography: "Fotografía",
  music: "Música",
};

export function RankingsGraphicsPanel({
  data,
  type,
  selectedIndex,
  onSelectItem,
  isLoading,
}: RankingsGraphicsPanelProps) {
  const [chartType, setChartType] = React.useState<ChartType>("bar");
  const calculations = useRankingCalculations(data);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-foreground">
          Análisis Visual
        </h3>
        <p className="text-sm text-muted-foreground">
          Gráficos interactivos de tus preferencias cinematográficas
        </p>
      </div>

      {/* Stats Grid */}
      {!isLoading && data.length > 0 && (
        <RankingStatsGrid
          totalMoviesInTop10={calculations.totalMoviesInTop10}
          leaderKey={calculations.leaderKey}
          leaderCount={calculations.leaderCount}
          averageRating={calculations.averageRating}
          totalUniqueItems={calculations.totalUniqueItems}
          typeLabel={TYPE_LABELS[type]}
        />
      )}

      {/* Gráfico Principal */}
      <RankingChartSection
        chartType={chartType}
        onChartTypeChange={setChartType}
        data={data}
        type={type}
        selectedIndex={selectedIndex}
        onSelectItem={onSelectItem}
        isLoading={isLoading}
      />

      {/* Información del Item Seleccionado */}
      {selectedIndex !== null && data[selectedIndex] && (
        <div className="border border-border/40 rounded-xl bg-card/20 backdrop-blur-xl p-4 transition-[background-color,border-color] duration-200">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Seleccionado
          </h4>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              #{selectedIndex + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg text-foreground truncate">
                {data[selectedIndex].key}
              </p>
              <p className="text-sm text-muted-foreground">
                {data[selectedIndex].count} películas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
