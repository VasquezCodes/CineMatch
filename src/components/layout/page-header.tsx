import * as React from "react";
import { cn } from "@/lib/utils";
import { PageHeaderAnimated } from "./page-header-animated";

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
  /**
   * Deshabilitar animaciones para mejor LCP en páginas críticas
   * Cuando es true, el título aparece inmediatamente sin animación
   */
  disableAnimations?: boolean;
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
  disableAnimations = false,
}: PageHeaderProps) {
  // Contenido del header (título y descripción)
  const headerContent = (
    <>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </>
  );

  return (
    <header className={cn("space-y-4", className)}>
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {disableAnimations ? (
          // Sin animaciones - render inmediato para mejor LCP
          <div className="space-y-2 flex-1">{headerContent}</div>
        ) : (
          // Con animaciones de reveal
          <PageHeaderAnimated className="space-y-2 flex-1">
            {headerContent}
          </PageHeaderAnimated>
        )}

        {actions && (
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

