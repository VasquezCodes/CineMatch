import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps {
  /**
   * Título principal de la página
   */
  title: string;
  /**
   * Descripción opcional de la página
   */
  description?: string;
  /**
   * Acciones opcionales (botones, etc) alineadas a la derecha en desktop
   */
  actions?: React.ReactNode;
  /**
   * Breadcrumb opcional (no implementado por ahora, slot reservado)
   */
  breadcrumb?: React.ReactNode;
  /**
   * Clases adicionales
   */
  className?: string;
}

/**
 * PageHeader
 * Componente reutilizable para headers de página con título, descripción y acciones.
 * Mantiene consistencia visual editorial y minimal.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Análisis de cinefilia"
 *   description="Procesamos patrones de tu historial"
 *   actions={<Button>Acción</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4", className)}>
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 flex-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

