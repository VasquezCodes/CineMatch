"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Film, User } from "lucide-react";
import type { RankingStatConfig, RankingType } from "../actions";

interface RankingsSidebarProps {
  data: RankingStatConfig[];
  type: RankingType;
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
  isLoading?: boolean;
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

// Tipos que muestran avatar de persona
const PERSON_TYPES: RankingType[] = ["director", "actor", "screenplay", "photography", "music"];

export function RankingsSidebar({
  data,
  type,
  selectedIndex,
  onSelectItem,
  isLoading = false,
}: RankingsSidebarProps) {
  const isPerson = PERSON_TYPES.includes(type);

  if (isLoading) {
    return <RankingsSidebarSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
        <Film className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay datos de {TYPE_LABELS[type].toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="font-semibold text-sm">Top 10 {TYPE_LABELS[type]}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click para resaltar en el gráfico
        </p>
      </div>

      {/* Lista scrolleable */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {data.slice(0, 10).map((item, index) => {
            const isSelected = selectedIndex === index;
            const avgRating = item.data.movies.length > 0
              ? (item.data.movies.reduce((sum, m) => sum + (m.user_rating || 0), 0) / item.data.movies.length).toFixed(1)
              : "N/A";

            return (
              <button
                key={item.key}
                onClick={() => onSelectItem(index)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                  "hover:bg-muted/60",
                  isSelected && "bg-primary/10 border border-primary/30"
                )}
              >
                {/* Posición */}
                <div
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-600",
                    index === 1 && "bg-slate-400/20 text-slate-500",
                    index === 2 && "bg-amber-600/20 text-amber-700",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>

                {/* Avatar o icono */}
                {isPerson ? (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={item.data.image_url} alt={item.key} />
                    <AvatarFallback className="text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
                    <Film className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.key}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.count} películas</span>
                    <span className="text-primary">★ {avgRating}</span>
                  </div>
                </div>

                {/* Badge de count */}
                <Badge variant="secondary" className="flex-shrink-0 text-xs">
                  {item.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer con stats */}
      <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Total películas</span>
          <span className="font-medium">
            {data.slice(0, 10).reduce((sum, item) => sum + item.count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

function RankingsSidebarSkeleton() {
  const { Skeleton } = require("@/components/ui/skeleton");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border/50">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40 mt-1" />
      </div>
      <div className="flex-1 p-2 space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
            <Skeleton className="h-5 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
