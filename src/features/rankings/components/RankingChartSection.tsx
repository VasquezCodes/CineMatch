import {
  ChartSelector,
  RankingBarChart,
  RankingPieChart,
  type ChartType,
} from "./charts";
import { Skeleton } from "@/components/ui/skeleton";
import type { RankingStatConfig, RankingType } from "../actions";

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

      <div className="border border-border/40 rounded-xl bg-card/20 backdrop-blur-xl p-4 md:p-6 overflow-x-hidden transition-[background-color,border-color] duration-200 hover:bg-card/30 hover:border-border/60">
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
      </div>
    </div>
  );
}
