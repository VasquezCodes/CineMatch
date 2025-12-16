import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingStateProps {
  /**
   * Etiqueta descriptiva del loading (opcional)
   */
  label?: string;
  /**
   * Clases adicionales para el contenedor
   */
  className?: string;
}

/**
 * LoadingState - Componente para mostrar estados de carga consistentes
 *
 * @example
 * ```tsx
 * <LoadingState label="Cargando películas..." />
 * ```
 */
export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8",
        "min-h-[280px] sm:min-h-[320px]",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-48" />
        {label && (
          <p className="text-sm text-muted-foreground text-center">{label}</p>
        )}
      </div>
    </Card>
  );
}

