"use client";

import { useState, useTransition, useMemo } from "react";
import { cn } from "@/lib/utils";
import { toggleUserMovieQuality } from "../actions";
import type { QualityCategoryWithSelection } from "../types";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Paleta de colores orgánicos y sensoriales
const COLOR_VARIANTS = [
  {
    base: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 hover:bg-rose-500/20",
    selected: "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20 hover:bg-rose-600",
  },
  {
    base: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/30 hover:bg-violet-500/20",
    selected: "bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/20 hover:bg-violet-600",
  },
  {
    base: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 hover:bg-amber-500/20",
    selected: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 hover:bg-amber-600",
  },
  {
    base: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-500/20",
    selected: "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20 hover:bg-emerald-600",
  },
  {
    base: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-500/20",
    selected: "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20 hover:bg-indigo-600",
  },
  {
    base: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30 hover:bg-cyan-500/20",
    selected: "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20 hover:bg-cyan-600",
  },
  {
    base: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/30 hover:bg-orange-500/20",
    selected: "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 hover:bg-orange-600",
  },
  {
    base: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900/30 hover:bg-fuchsia-500/20",
    selected: "bg-fuchsia-500 text-white border-fuchsia-500 shadow-md shadow-fuchsia-500/20 hover:bg-fuchsia-600",
  },
];

// Radios de borde variados para aspecto orgánico
const BORDER_RADII = [
  "rounded-full",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-tr-3xl rounded-bl-3xl rounded-tl-xl rounded-br-xl",
  "rounded-tl-3xl rounded-br-3xl rounded-tr-xl rounded-bl-xl",
];

type Props = {
  movieId: string;
  categories: QualityCategoryWithSelection[];
  onComplete?: () => void;
};

export function QualificationSelector({ movieId, categories, onComplete }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] = useState(categories);

  // Aplanar todas las cualidades en una sola lista
  const allQualities = useMemo(() => {
    return localCategories.flatMap((cat) =>
      cat.qualities.map((q) => ({
        ...q,
        categoryId: cat.id,
      }))
    ).sort((a, b) => a.name.length - b.name.length); // Ordenar un poco por longitud para mejor flujo visual
  }, [localCategories]);

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

  const selectedCount = allQualities.filter((q) => q.selected).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-4 flex flex-col min-h-0">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-2">
          <AnimatePresence mode="popLayout">
            {allQualities.map((quality, index) => {
              const colorVariant = COLOR_VARIANTS[index % COLOR_VARIANTS.length];
              const borderRadius = BORDER_RADII[index % BORDER_RADII.length];
              
              return (
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.02,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  key={quality.id}
                  onClick={() => handleToggleQuality(quality.categoryId, quality.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300 border",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "active:scale-90 min-h-[40px] cursor-pointer",
                    borderRadius,
                    quality.selected
                      ? colorVariant.selected
                      : colorVariant.base
                  )}
                >
                  {quality.selected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    </motion.span>
                  )}
                  <span className="leading-tight select-none">{quality.name}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer con conteo y acción final */}
      <div className="pt-6 border-t border-border/30 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>{selectedCount} cualidades seleccionadas</span>
        </div>

        <Button
          onClick={onComplete}
          size="lg"
          className="w-full sm:w-auto min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xl shadow-primary/20 rounded-2xl group"
        >
          Finalizar
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <Check className="ml-2 h-4 w-4" />
          </motion.div>
        </Button>
      </div>
    </div>
  );
}
