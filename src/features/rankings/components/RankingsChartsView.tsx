"use client";

import * as React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TrendingUp } from "lucide-react";
import { RankingChartSection } from "./RankingChartSection";
import { RankingDetailList } from "./RankingDetailList";
import { RankingItemMovies } from "./RankingItemMovies";
import type { ChartType } from "./charts";
import type { RankingStatConfig, RankingType } from "../actions";
import { useRankingCalculations } from "../hooks/useRankingCalculations";

interface RankingsChartsViewProps {
  data: RankingStatConfig[];
  type: RankingType;
  isLoading: boolean;
  error: string | null;
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

export function RankingsChartsView({
  data,
  type,
  isLoading,
  error,
}: RankingsChartsViewProps) {
  const [chartType, setChartType] = React.useState<ChartType>("bar");
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const calculations = useRankingCalculations(data);

  React.useEffect(() => {
    setSelectedIndex(null);
  }, [data, type]);

  const handleSelectItem = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  if (error) {
    return <ErrorState title="Error al cargar rankings" description={error} />;
  }

  if (!isLoading && data.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp className="h-12 w-12" />}
        title={`No hay rankings de ${TYPE_LABELS[type].toLowerCase()}`}
        description="Califica más películas para ver rankings personalizados."
      />
    );
  }

  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4 lg:gap-6">
      <section>
        {selectedItem ? (
          <RankingItemMovies
            item={selectedItem}
            index={selectedIndex!}
            type={type}
            onBack={() => setSelectedIndex(null)}
          />
        ) : (
          <RankingChartSection
            chartType={chartType}
            onChartTypeChange={setChartType}
            data={data}
            type={type}
            selectedIndex={selectedIndex}
            onSelectItem={handleSelectItem}
            isLoading={isLoading}
          />
        )}
      </section>

      {!isLoading && data.length > 0 && (
        <RankingDetailList
          data={calculations.top10Data}
          type={type}
          selectedIndex={selectedIndex}
          onSelectItem={handleSelectItem}
        />
      )}
    </div>
  );
}
