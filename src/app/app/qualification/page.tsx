"use client";

import { useState } from "react";
import { PageHeader, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ========================================
   DATA MOCK
   ======================================== */

interface Quality {
  id: string;
  label: string;
  hint?: string;
}

interface Step {
  id: string;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: "seen-heard",
    label: "Lo visto y oído",
    description: "Elementos visuales y sonoros que captaron tu atención",
  },
  {
    id: "felt",
    label: "Lo sentido",
    description: "Emociones y sensaciones que experimentaste",
  },
  {
    id: "thought",
    label: "Lo pensado",
    description: "Reflexiones e ideas que surgieron durante el visionado",
  },
  {
    id: "valued",
    label: "Lo valorado",
    description: "Aspectos que consideras más importantes de la película",
  },
];

const QUALITIES_BY_STEP: Record<string, Quality[]> = {
  "seen-heard": [
    { id: "cinematography", label: "Cinematografía", hint: "Composición visual" },
    { id: "lighting", label: "Iluminación", hint: "Uso de luz y sombra" },
    { id: "sound-design", label: "Diseño de sonido", hint: "Efectos y ambiente" },
    { id: "music", label: "Música", hint: "Banda sonora y score" },
    { id: "editing", label: "Montaje", hint: "Ritmo y transiciones" },
    { id: "art-direction", label: "Dirección de arte", hint: "Escenografía y vestuario" },
  ],
  felt: [
    { id: "tension", label: "Tensión", hint: "Suspenso y anticipación" },
    { id: "joy", label: "Alegría", hint: "Momentos de felicidad" },
    { id: "sadness", label: "Tristeza", hint: "Melancolía y pérdida" },
    { id: "fear", label: "Miedo", hint: "Inquietud y terror" },
    { id: "empathy", label: "Empatía", hint: "Conexión con personajes" },
    { id: "surprise", label: "Sorpresa", hint: "Giros inesperados" },
  ],
  thought: [
    { id: "philosophy", label: "Filosofía", hint: "Cuestionamientos existenciales" },
    { id: "social-critique", label: "Crítica social", hint: "Comentario sobre la sociedad" },
    { id: "morality", label: "Moralidad", hint: "Dilemas éticos" },
    { id: "identity", label: "Identidad", hint: "Búsqueda del yo" },
    { id: "time", label: "Tiempo", hint: "Percepción temporal" },
    { id: "memory", label: "Memoria", hint: "Recuerdos y nostalgia" },
  ],
  valued: [
    { id: "originality", label: "Originalidad", hint: "Propuesta única" },
    { id: "authenticity", label: "Autenticidad", hint: "Honestidad narrativa" },
    { id: "complexity", label: "Complejidad", hint: "Capas de significado" },
    { id: "craft", label: "Oficio", hint: "Maestría técnica" },
    { id: "impact", label: "Impacto", hint: "Huella duradera" },
    { id: "entertainment", label: "Entretenimiento", hint: "Disfrute puro" },
  ],
};

/* ========================================
   COMPONENT
   ======================================== */

export default function QualificationPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const currentStep = STEPS[stepIndex];
  const currentQualities = QUALITIES_BY_STEP[currentStep.id];
  const selectedCount = currentQualities.filter((q) => selected[q.id]).length;

  const handleToggle = (qualityId: string) => {
    setSelected((prev) => ({
      ...prev,
      [qualityId]: !prev[qualityId],
    }));
  };

  const handlePrevious = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleStepClick = (index: number) => {
    setStepIndex(index);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Definí tu perfil cinéfilo"
        description="Esto nos ayuda a recomendarte películas alineadas a cómo mirás cine, no solo por género o popularidad."
      />

      <Section>
        <div className="space-y-8">
          {/* Mensaje de onboarding */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground">
              Seleccioná las cualidades que más valoras del cine. Podrás editar estas preferencias más adelante desde tu perfil.
            </p>
          </div>
          {/* Stepper */}
          <nav aria-label="Progreso de cualificación">
            <ol className="flex items-center justify-between gap-2">
              {STEPS.map((step, index) => {
                const isActive = index === stepIndex;
                const isPast = index < stepIndex;

                return (
                  <li key={step.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => handleStepClick(index)}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                        "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isActive &&
                          "border-primary bg-primary/5 text-foreground",
                        !isActive && isPast && "border-border text-muted-foreground",
                        !isActive && !isPast && "border-border/50 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                            isActive && "bg-primary text-primary-foreground",
                            !isActive && isPast && "bg-muted text-muted-foreground",
                            !isActive && !isPast && "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="hidden text-sm font-medium sm:inline">
                          {step.label}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Step Content */}
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {currentStep.label}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStep.description}
              </p>
              {selectedCount > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {selectedCount} seleccionada{selectedCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Qualities Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {currentQualities.map((quality) => {
                const isSelected = selected[quality.id];

                return (
                  <button
                    key={quality.id}
                    type="button"
                    onClick={() => handleToggle(quality.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "group rounded-xl border bg-card p-6 text-left transition-all",
                      "hover:border-primary/50 hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">
                          {quality.label}
                        </h3>
                        <div
                          className={cn(
                            "h-5 w-5 shrink-0 rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30 group-hover:border-primary/50"
                          )}
                        >
                          {isSelected && (
                            <svg
                              className="h-full w-full text-primary-foreground"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      {quality.hint && (
                        <p className="text-sm text-muted-foreground">
                          {quality.hint}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={stepIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="text-sm text-muted-foreground">
                Paso {stepIndex + 1} de {STEPS.length}
              </div>

              <Button
                variant={stepIndex === STEPS.length - 1 ? "default" : "outline"}
                onClick={handleNext}
                disabled={stepIndex === STEPS.length - 1}
                className="gap-2"
              >
                {stepIndex === STEPS.length - 1 ? "Finalizar" : "Siguiente"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

