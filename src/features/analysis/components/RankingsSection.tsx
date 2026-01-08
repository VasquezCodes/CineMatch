"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { RankingCard } from "./RankingCard";
import { RankingsSheet } from "./RankingsSheet";
import { getRanking, type RankingType } from "@/features/rankings/actions";
import { cn } from "@/lib/utils";

interface RankingsSectionProps {
  userId: string;
}

const RANKING_TYPES: Array<{ value: RankingType; label: string }> = [
  { value: "director", label: "Directores" },
  { value: "actor", label: "Actores" },
  { value: "genre", label: "Géneros" },
  { value: "year", label: "Años" },
  { value: "screenplay", label: "Guionistas" },
  { value: "photography", label: "Fotografía" },
  { value: "music", label: "Música" },
];

export function RankingsSection({ userId }: RankingsSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<RankingType>("director");
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetRankingType, setSheetRankingType] = React.useState<RankingType>("director");

  const [data, setData] = React.useState<Record<RankingType, any[] | undefined>>({
    director: undefined,
    actor: undefined,
    genre: undefined,
    year: undefined,
    screenplay: undefined,
    photography: undefined,
    music: undefined,
  });
  const [loading, setLoading] = React.useState<Record<RankingType, boolean>>({
    director: false, // Cambiado a false, la lógica manejará la carga inicial
    actor: false,
    genre: false,
    year: false,
    screenplay: false,
    photography: false,
    music: false,
  });
  const [error, setError] = React.useState<string | null>(null);

  // Cargar datos del tab activo
  React.useEffect(() => {
    if (isCollapsed) return; // No cargar si está colapsado

    const loadRankingData = async () => {
      // Si ya hay datos o estamos cargando, no recargar
      if (data[activeTab] !== undefined || loading[activeTab]) return;

      setLoading((prev) => ({ ...prev, [activeTab]: true }));
      setError(null);

      try {
        const result = await getRanking(userId, activeTab, {
          minRating: 1,
          limit: 5, // Solo Top 5 para la vista compacta
        });
        setData((prev) => ({ ...prev, [activeTab]: result }));
      } catch (err) {
        console.error("Error loading ranking data:", err);
        setError("Error al cargar los rankings. Intenta nuevamente.");
      } finally {
        setLoading((prev) => ({ ...prev, [activeTab]: false }));
      }
    };

    loadRankingData();
  }, [activeTab, userId, data, isCollapsed, loading]);

  const currentData = data[activeTab] || [];
  const isLoading = loading[activeTab];
  const currentLabel = RANKING_TYPES.find((t) => t.value === activeTab)?.label || "";

  const handleViewMore = (type: RankingType) => {
    setSheetRankingType(type);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header con toggle de colapsar */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">Rankings</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Descubre tus preferencias cinematográficas
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="gap-2"
          >
            {isCollapsed ? (
              <>
                Expandir
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                Colapsar
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Contenido colapsable */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
          )}
        >
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RankingType)}>
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
                    description={error}
                  />
                ) : currentData.length === 0 ? (
                  <EmptyState
                    icon={<TrendingUp className="h-12 w-12" />}
                    title={`No hay rankings de ${type.label.toLowerCase()}`}
                    description="Califica más películas para ver rankings personalizados."
                  />
                ) : (
                  <>
                    {/* Grid responsive: 1 columna en mobile, 2 en desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {currentData.map((item, index) => (
                        <RankingCard
                          key={item.name}
                          item={item}
                          index={index}
                          type={type.value}
                          onViewMore={() => handleViewMore(type.value)}
                          compact
                        />
                      ))}
                    </div>

                    {/* Botón para ver Top 10 completo */}
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
      </div>

      {/* Sheet para ver Top 10 completo */}
      <RankingsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        userId={userId}
        rankingType={sheetRankingType}
        rankingLabel={currentLabel}
      />
    </>
  );
}

// Skeleton component local
function RankingsSkeleton() {
  const { Skeleton } = require("@/components/ui/skeleton");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
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

