"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PanelLeftClose, PanelLeftOpen, TrendingUp } from "lucide-react";
import { RankingsSidebar } from "./RankingsSidebar";
import {
  ChartSelector,
  RankingBarChart,
  RankingPieChart,
  type ChartType,
} from "./charts";
import type { RankingStatConfig, RankingType } from "../actions";

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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Resetear selección cuando cambian los datos
  React.useEffect(() => {
    setSelectedIndex(null);
  }, [data, type]);

  const handleSelectItem = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  if (error) {
    return (
      <ErrorState
        title="Error al cargar rankings"
        description={error}
      />
    );
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

  // Renderizar el gráfico seleccionado
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
            onSelectItem={handleSelectItem}
          />
        );
      case "pie":
        return (
          <RankingPieChart
            data={data}
            selectedIndex={selectedIndex}
            onSelectItem={handleSelectItem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[400px] lg:min-h-[500px]">
      {/* Sidebar - Desktop (siempre visible) */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-shrink-0 border border-border/50 rounded-xl bg-card/30 overflow-hidden">
        <RankingsSidebar
          data={data}
          type={type}
          selectedIndex={selectedIndex}
          onSelectItem={handleSelectItem}
          isLoading={isLoading}
        />
      </aside>

      {/* Área principal de gráficos */}
      <main className="flex-1 min-w-0 space-y-4">
        {/* Header con selector de gráfico y botón de sidebar móvil */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <ChartSelector value={chartType} onValueChange={setChartType} />

          {/* Botón para abrir sidebar en móvil/tablet */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-2"
              >
                <PanelLeftOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Top 10</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs sm:max-w-sm p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Top 10 {TYPE_LABELS[type]}</SheetTitle>
              </SheetHeader>
              <RankingsSidebar
                data={data}
                type={type}
                selectedIndex={selectedIndex}
                onSelectItem={(index) => {
                  handleSelectItem(index);
                  setSidebarOpen(false);
                }}
                isLoading={isLoading}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Contenedor del gráfico */}
        <div className="border border-border/50 rounded-xl bg-card/30 p-4 md:p-6">
          {/* Título del gráfico */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {chartType === "bar" && "Comparación por cantidad de películas"}
              {chartType === "pie" && "Distribución porcentual"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {chartType === "bar" && "Visualiza cuántas películas tienes de cada " + TYPE_LABELS[type].toLowerCase().slice(0, -1)}
              {chartType === "pie" && "Proporción de tu colección por " + TYPE_LABELS[type].toLowerCase().slice(0, -1)}
            </p>
          </div>

          {/* Gráfico */}
          {renderChart()}

          {/* Info de item seleccionado */}
          {selectedIndex !== null && data[selectedIndex] && (
            <SelectedItemInfo item={data[selectedIndex]} index={selectedIndex} />
          )}
        </div>

        {/* Stats rápidos */}
        {!isLoading && data.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              label="Total en Top 10"
              value={data.slice(0, 10).reduce((sum, item) => sum + item.count, 0)}
              suffix="películas"
            />
            <StatCard
              label="Líder"
              value={data[0]?.key || "-"}
              suffix={`${data[0]?.count || 0} películas`}
            />
            <StatCard
              label="Promedio"
              value={calculateAverageRating(data.slice(0, 10))}
              suffix="rating"
              prefix="★"
            />
            <StatCard
              label={TYPE_LABELS[type]}
              value={data.length}
              suffix="únicos"
            />
          </div>
        )}
      </main>
    </div>
  );
}

// Componente para mostrar info del item seleccionado
function SelectedItemInfo({
  item,
  index,
}: {
  item: RankingStatConfig;
  index: number;
}) {
  const avgRating = item.data.movies.length > 0
    ? (item.data.movies.reduce((sum, m) => sum + (m.user_rating || 0), 0) / item.data.movies.length).toFixed(1)
    : "N/A";

  return (
    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="font-medium">{item.key}</p>
          <p className="text-sm text-muted-foreground">
            {item.count} películas · Rating promedio: <span className="text-star-yellow font-semibold">★ {avgRating}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para stats rápidos
function StatCard({
  label,
  value,
  suffix,
  prefix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div className="p-3 rounded-lg border border-border/50 bg-card/30">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold truncate">
        {prefix && <span className="text-star-yellow mr-1">{prefix}</span>}
        {value}
      </p>
      {suffix && (
        <p className="text-xs text-muted-foreground">{suffix}</p>
      )}
    </div>
  );
}

// Skeleton para el gráfico
function ChartSkeleton() {
  const { Skeleton } = require("@/components/ui/skeleton");

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

// Función helper para calcular rating promedio
function calculateAverageRating(data: RankingStatConfig[]): string {
  const allMovies = data.flatMap((item) => item.data.movies);
  if (allMovies.length === 0) return "N/A";
  const sum = allMovies.reduce((acc, m) => acc + (m.user_rating || 0), 0);
  return (sum / allMovies.length).toFixed(1);
}
