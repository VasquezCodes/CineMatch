import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export interface ErrorStateProps {
  /**
   * Título del error
   */
  title: string;
  /**
   * Descripción opcional (mensaje de ayuda)
   */
  description?: string;
  /**
   * Botón de acción o CTA opcional (ej: botón de reintentar)
   */
  action?: React.ReactNode;
  /**
   * Clases adicionales para el contenedor
   */
  className?: string;
}

/**
 * ErrorState - Componente para mostrar estados de error consistentes
 * Usa estilos neutros (sin rojo, que no está aprobado en la paleta).
 *
 * @example
 * ```tsx
 * <ErrorState
 *   title="No se pudo cargar"
 *   description="Hubo un problema al obtener los datos"
 *   action={<Button>Reintentar</Button>}
 * />
 * ```
 */
export function ErrorState({
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        "min-h-[280px] sm:min-h-[320px]",
        "border-border",
        className
      )}
    >
      <div className="text-muted-foreground" aria-hidden="true">
        <AlertCircle className="h-12 w-12" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}

