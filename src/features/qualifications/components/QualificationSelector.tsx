"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleUserMovieQuality } from "../actions";
import type { QualityCategoryWithSelection } from "../types";
import { ChevronDown, ChevronUp, Check, Star } from "lucide-react";

// Mapeo simple de colores usando las variables CSS existentes
const CATEGORY_COLORS: Record<number, string> = {
  1: "text-[hsl(var(--chart-1))]", // Verde
  2: "text-[hsl(var(--chart-9))]", // Ámbar
  3: "text-[hsl(var(--chart-6))]", // Azul-violeta
  4: "text-[hsl(var(--chart-4))]", // Cyan
};

type Props = {
  movieId: string;
  categories: QualityCategoryWithSelection[];
};

export function QualificationSelector({ movieId, categories }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] = useState(categories);
  // Todas las categorías expandidas por defecto
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(categories.map(cat => cat.id))
  );

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleToggleQuality = (categoryId: number, qualityId: number) => {
    // Optimistic update
    setLocalCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            qualities: cat.qualities.map((q) =>
              q.id === qualityId ? { ...q, selected: !q.selected } : q
            ),
          }
          : cat
      )
    );

    startTransition(async () => {
      const result = await toggleUserMovieQuality(movieId, qualityId);
      if (!result.success) {
        // Revertir en caso de error
        setLocalCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? {
                ...cat,
                qualities: cat.qualities.map((q) =>
                  q.id === qualityId ? { ...q, selected: !q.selected } : q
                ),
              }
              : cat
          )
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          ¿Qué destacarías?
        </h3>
        <p className="text-[0.8rem] text-muted-foreground">
          Selecciona las cualidades que definen esta película para ti.
        </p>
      </div>

      {/* Categorías */}
      <div className="grid gap-4">
        {localCategories.map((category, index) => {
          const isExpanded = expandedCategories.has(category.id);
          const selectedCount = category.qualities.filter((q) => q.selected).length;
          const totalQualities = category.qualities.length;
          const accentColorClass = CATEGORY_COLORS[category.id] || "text-primary";

          return (
            <div
              key={category.id}
              className={cn(
                "group rounded-xl border border-border/50 bg-card/40 transition-all duration-200",
                "hover:bg-card/60 hover:border-border",
                isExpanded && "bg-card/60 border-border"
              )}
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between p-4 text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg bg-background/50 ring-1 ring-border/50 transition-colors",
                    "group-hover:bg-background group-hover:ring-border",
                    accentColorClass
                  )}>
                    {/* Icono genérico minimalista o específico si se desea */}
                    <Star className="h-4 w-4 fill-current opacity-70" />
                  </span>

                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-foreground/90">{category.name}</span>
                    {selectedCount > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {selectedCount} seleccionados
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Indicador de progreso */}
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 ease-out",
                        accentColorClass.replace('text-', 'bg-')
                      )}
                      style={{ width: `${(selectedCount / totalQualities) * 100}%` }}
                    />
                  </div>

                  <span className="text-muted-foreground transition-transform duration-200">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </button>

              {/* Qualities Grid */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 p-4 pt-0">
                    {category.qualities.map((quality) => (
                      <button
                        key={quality.id}
                        onClick={() => handleToggleQuality(category.id, quality.id)}
                        disabled={isPending}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                          "border border-transparent",
                          "hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          quality.selected
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                            : "bg-secondary/50 text-secondary-foreground hover:bg-secondary border-transparent hover:border-border/50"
                        )}
                      >
                        {quality.selected && <Check className="h-3 w-3" />}
                        {quality.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
