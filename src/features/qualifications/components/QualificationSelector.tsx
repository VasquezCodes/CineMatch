"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleUserMovieQuality } from "../actions";
import type { QualityCategoryWithSelection } from "../types";
import { Check, Eye, Heart, Brain, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

// Mapeo simple de colores usando las variables CSS existentes
const CATEGORY_COLORS: Record<number, string> = {
  1: "text-[hsl(var(--chart-1))]", // Verde
  2: "text-[hsl(var(--chart-9))]", // Ámbar
  3: "text-[hsl(var(--chart-6))]", // Azul-violeta
  4: "text-[hsl(var(--chart-4))]", // Cyan
};

// Mapeo de iconos temáticos por categoría
const CATEGORY_ICONS: Record<number, LucideIcon> = {
  1: Eye,      // Lo visto y oído
  2: Heart,    // Lo sentido
  3: Brain,    // Reflexión/Análisis
  4: Sparkles, // Impacto/Creatividad
};

type Props = {
  movieId: string;
  categories: QualityCategoryWithSelection[];
  onComplete?: () => void;
};

export function QualificationSelector({ movieId, categories, onComplete }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] = useState(categories);
  const [currentStep, setCurrentStep] = useState(0);

  const currentCategory = localCategories[currentStep];
  const totalSteps = localCategories.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
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

  const selectedCount = currentCategory.qualities.filter((q) => q.selected).length;
  const accentColorClass = CATEGORY_COLORS[currentCategory.id] || "text-primary";
  const IconComponent = CATEGORY_ICONS[currentCategory.id] || Sparkles;

  return (
    <div className="flex flex-col h-full">
      {/* Progress Indicator */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Paso {currentStep + 1} de {totalSteps}</span>
          <span>{selectedCount} seleccionados</span>
        </div>
        <div className="flex gap-1.5">
          {localCategories.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                index <= currentStep ? "bg-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>
      </div>

      {/* Category Content */}
      <div className="flex-1 space-y-4 animate-fadeIn">
        {/* Category Header */}
        <div className="flex items-center gap-3">
          <span className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-background/50 ring-1 ring-border/50",
            accentColorClass
          )}>
            <IconComponent className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-semibold text-foreground">
              {currentCategory.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Selecciona las cualidades que destacarías
            </p>
          </div>
        </div>

        {/* Qualities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
          {currentCategory.qualities.map((quality) => (
            <button
              key={quality.id}
              onClick={() => handleToggleQuality(currentCategory.id, quality.id)}
              disabled={isPending}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "active:scale-95 min-h-[44px]",
                quality.selected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90"
                  : "bg-secondary/50 text-secondary-foreground border-border/50 hover:bg-secondary hover:border-border"
              )}
            >
              {quality.selected && <Check className="h-4 w-4 shrink-0" />}
              <span className="text-center leading-tight">{quality.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-6 border-t border-border/30 mt-auto">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className={cn(
            "flex-1",
            isFirstStep && "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            onClick={onComplete}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
          >
            Guardar y Finalizar
            <Check className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Continuar
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
