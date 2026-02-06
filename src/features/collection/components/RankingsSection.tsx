"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ChevronDown, ChevronUp, TrendingUp, Filter } from "lucide-react";
import { RankingCard } from "@/components/shared/RankingCard";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RankingsExpandedView } from "@/features/rankings/components/RankingsExpandedView";
import { useRankings } from "@/features/rankings/hooks/useRankings";
import { type RankingType } from "@/features/rankings/actions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface RankingsSectionProps {
  userId: string;
  activeTab?: RankingType;
  onTabChange?: (type: RankingType) => void;
}

const RANKING_TYPES: Array<{ value: RankingType; label: string }> = [
  { value: "director", label: "Directores" },
  { value: "actor", label: "Actores" },
  { value: "screenplay", label: "Guionistas" },
  { value: "photography", label: "Fotografía" },
  { value: "music", label: "Música" },
  { value: "genre", label: "Géneros" },
  { value: "year", label: "Años" },
];

export function RankingsSection({ userId, activeTab: propActiveTab, onTabChange }: RankingsSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [internalActiveTab, setInternalActiveTab] = React.useState<RankingType>("director");

  // Use prop if provided, else internal state
  const activeTab = propActiveTab || internalActiveTab;

  const handleTabChange = (val: string) => {
    const newVal = val as RankingType;
    if (onTabChange) {
      onTabChange(newVal);
    } else {
      setInternalActiveTab(newVal);
    }
  };
  const [expandedView, setExpandedView] = React.useState(false);
  const [expandedType, setExpandedType] = React.useState<RankingType | null>(null);

  const [minRating, setMinRating] = React.useState([0]);

  // Debounce para minRating para evitar saturar la consulta
  const [debouncedMinRating, setDebouncedMinRating] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinRating(minRating[0]);
    }, 500);
    return () => clearTimeout(timer);
  }, [minRating]);

  // Hook de React Query - carga diferida + caché automático de 5 minutos
  const { data: rawData, isLoading, error } = useRankings(
    userId,
    activeTab,
    { minRating: debouncedMinRating, limit: 20 },
    !isCollapsed // Solo realizar petición cuando no está colapsado
  );

  const currentData = React.useMemo(
    () => (rawData || []).slice(0, 5),
    [rawData]
  );

  const handleViewMore = React.useCallback((type: RankingType) => {
    setExpandedType(type);
    setExpandedView(true);
  }, []);

  // Si está en vista expandida, mostrar solo esa vista
  if (expandedView && expandedType) {
    return (
      <RankingsExpandedView
        userId={userId}
        type={expandedType}
        onBack={() => {
          setExpandedView(false);
          setExpandedType(null);
        }}
      />
    );
  }

  // Vista normal de cards
  return (
    <div className="space-y-4">
      {/* Header con botón de colapsar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Rankings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Descubre tus preferencias cinematográficas
          </p>
        </div>

        {/* Botón de colapsar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="gap-2"
        >
          {isCollapsed ? (
            <>
              <span className="hidden sm:inline">Expandir</span>
              <ChevronDown className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Colapsar</span>
              <ChevronUp className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Panel de Filtros - Solo visible cuando está expandido */}
      {
        !isCollapsed && (
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filtros de Análisis</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Calificación mínima: {minRating[0] === 0 ? "Todas" : `★ ${minRating[0]}`}</span>
                  <span>Considerar películas rated {minRating[0]}+</span>
                </div>
                <Slider
                  defaultValue={[0]}
                  value={minRating}
                  onValueChange={setMinRating}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )
      }

      {/* Contenido colapsable */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        )}
      >
        <Tabs id="rankings-tabs" value={activeTab} onValueChange={handleTabChange}>
          {/* Lista de tabs responsive */}
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-muted/50">
            {RANKING_TYPES.map((type) => (
              <TabsTrigger
                key={type.value}
                value={type.value}
                className="shrink-0 data-[state=active]:bg-background text-xs md:text-sm"
              >
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Contenido de cada tab */}
          {RANKING_TYPES.map((type) => (
            <TabsContent key={type.value} value={type.value} className="mt-6">
              {isLoading && type.value === activeTab ? (
                <RankingsSkeleton />
              ) : error ? (
                <ErrorState
                  title="Error al cargar rankings"
                  description={error.message}
                />
              ) : currentData.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="h-12 w-12" />}
                  title={`No hay rankings de ${type.label.toLowerCase()}`}
                  description="Califica más películas para ver rankings personalizados."
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {currentData.map((item, index) => (
                      <RankingCard
                        key={item.key}
                        item={item}
                        index={index}
                        type={type.value}
                        onViewMore={() => handleViewMore(type.value)}
                        compact
                        variant="collection"
                      />
                    ))}
                  </div>

                  {currentData.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => handleViewMore(type.value)}
                        className="gap-2"
                      >
                        Ver Top 10 completo de {type.label}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div >
  );
}

// Componente Skeleton local - memorizado para evitar re-renderizados
const RankingsSkeleton = React.memo(function RankingsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border/40 p-4 bg-card/30">
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
            {[...Array(3)].map((_, j) => (
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
});
