import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { STATE_CARD_BASE_CLASSES } from "./state-constants";

export interface EmptyStateProps {
  /**
   * Título principal del estado vacío
   */
  title: string;
  /**
   * Descripción opcional (texto de ayuda)
   */
  description?: string;
  /**
   * Ícono o elemento visual opcional
   */
  icon?: React.ReactNode;
  /**
   * Botón de acción o CTA opcional
   */
  action?: React.ReactNode;
  /**
   * Clases adicionales para el contenedor
   */
  className?: string;
}

/**
 * EmptyState - Componente para mostrar estados vacíos consistentes
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Film className="h-12 w-12" />}
 *   title="No hay películas"
 *   description="Agrega películas a tu biblioteca para comenzar"
 *   action={<Button>Explorar películas</Button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        STATE_CARD_BASE_CLASSES,
        "border-dashed",
        className
      )}
    >
      {icon && (
        <div className="text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}

      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold tracking-tight">
          {title}
        </h3>
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

