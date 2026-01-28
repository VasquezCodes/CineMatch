"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankingsGraphicsPanel } from "./RankingsGraphicsPanel";
import { RankingsDetailPanel } from "./RankingsDetailPanel";
import { getRanking, type RankingType, type RankingStatConfig } from "../actions";
import { ArrowLeft, BarChart3, List } from "lucide-react";

interface RankingsExpandedViewProps {
  userId: string;
  type: RankingType;
  onBack: () => void;
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

export function RankingsExpandedView({
  userId,
  type,
  onBack,
}: RankingsExpandedViewProps) {
  const [data, setData] = React.useState<RankingStatConfig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  // Cargar datos cuando se monta el componente
  React.useEffect(() => {
    let isMounted = true;

    const loadFullRanking = async () => {
      try {
        const result = await getRanking(userId, type, {
          minRating: 1,
          limit: 20,
        });
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading ranking:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFullRanking();

    return () => {
      isMounted = false;
    };
  }, [userId, type]);

  const handleSelectItem = React.useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="space-y-6 transition-all duration-300 ease-in-out">
      {/* Header con botón volver */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/50">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a rankings
        </Button>
        <div className="flex-1 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {TYPE_LABELS[type]}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Análisis detallado con gráficos interactivos
          </p>
        </div>
        <div className="w-[120px]" /> {/* Spacer para centrar el título */}
      </div>

      {/* Desktop: 2 columnas lado a lado */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_420px] gap-6 min-h-[600px]">
        {/* Panel Izquierdo: Gráficos */}
        <RankingsGraphicsPanel
          data={data}
          type={type}
          selectedIndex={selectedIndex}
          onSelectItem={handleSelectItem}
          isLoading={loading}
        />

        {/* Panel Derecho: Detalles */}
        <RankingsDetailPanel
          data={data}
          type={type}
          selectedIndex={selectedIndex}
          onSelectItem={handleSelectItem}
          isLoading={loading}
        />
      </div>

      {/* Mobile/Tablet: Tabs para alternar entre vistas */}
      <div className="lg:hidden">
        <Tabs defaultValue="graphics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
            <TabsTrigger
              value="graphics"
              className="gap-2 data-[state=active]:bg-background"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Gráficos</span>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="gap-2 data-[state=active]:bg-background"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Detalles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="graphics" className="mt-6 space-y-6">
            <RankingsGraphicsPanel
              data={data}
              type={type}
              selectedIndex={selectedIndex}
              onSelectItem={handleSelectItem}
              isLoading={loading}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <RankingsDetailPanel
              data={data}
              type={type}
              selectedIndex={selectedIndex}
              onSelectItem={handleSelectItem}
              isLoading={loading}
              isMobile
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
