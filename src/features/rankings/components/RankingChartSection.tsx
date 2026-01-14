import {
  ChartSelector,
  RankingBarChart,
  RankingPieChart,
  type ChartType,
} from "./charts";
import { Skeleton } from "@/components/ui/skeleton";
import type { RankingStatConfig, RankingType } from "../actions";
import { calculateItemAverageRating } from "../hooks/useRankingCalculations";

interface SelectedItemInfoProps {
  item: RankingStatConfig;
  index: number;
}

function SelectedItemInfo({ item, index }: SelectedItemInfoProps) {
  const avgRating = calculateItemAverageRating(item);

  return (
    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="font-medium">{item.key}</p>
          <p className="text-sm text-muted-foreground">
            {item.count} películas · Rating promedio:{" "}
            <span className="text-star-yellow font-semibold">★ {avgRating}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[400px] w-full flex items-center justify-center">
      <div className="space-y-4 w-full">
        <div className="flex items-end gap-2 justify-center h-[300px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="w-12"
              style={{ height: `${Math.random() * 200 + 50}px` }}
            />
          ))}
        </div>
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

interface RankingChartSectionProps {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
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

export function RankingChartSection({
  chartType,
  onChartTypeChange,
  data,
  type,
  selectedIndex,
  onSelectItem,
  isLoading,
}: RankingChartSectionProps) {
  const renderChart = () => {
    if (isLoading) {
      return <ChartSkeleton />;
    }

    switch (chartType) {
      case "bar":
        return (
          <RankingBarChart
            data={data}
            selectedIndex={selectedIndex}
            onSelectItem={onSelectItem}
          />
        );
      case "pie":
        return (
          <RankingPieChart
            data={data}
            selectedIndex={selectedIndex}
            onSelectItem={onSelectItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <ChartSelector value={chartType} onValueChange={onChartTypeChange} />

      <div className="border border-border/50 rounded-xl bg-card/30 p-4 md:p-6">
        <header className="mb-4">
          <h3 className="text-lg font-semibold">
            {chartType === "bar" && "Comparación por cantidad de películas"}
            {chartType === "pie" && "Distribución porcentual"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {chartType === "bar" &&
              "Visualiza cuántas películas tienes de cada " +
                TYPE_LABELS[type].toLowerCase().slice(0, -1)}
            {chartType === "pie" &&
              "Proporción de tu colección por " +
                TYPE_LABELS[type].toLowerCase().slice(0, -1)}
          </p>
        </header>

        {renderChart()}

        {selectedIndex !== null && data[selectedIndex] && (
          <SelectedItemInfo item={data[selectedIndex]} index={selectedIndex} />
        )}
      </div>
    </div>
  );
}
