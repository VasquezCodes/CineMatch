import * as React from "react";
import { cn } from "@/lib/utils";
import { PageHeaderAnimated } from "./page-header-animated";

/* ========================================
   Section
   ======================================== */

export interface SectionProps {
  /**
   * Título opcional de la sección
   */
  title?: string;
  /**
   * Descripción opcional de la sección
   */
  description?: string;
  /**
   * Acciones opcionales alineadas a la derecha del título
   */
  actions?: React.ReactNode;
  /**
   * Contenido de la sección
   */
  children: React.ReactNode;
  /**
   * Clases adicionales
   */
  className?: string;
  /**
   * Deshabilitar animaciones para mejor performance
   */
  disableAnimations?: boolean;
}

/**
 * Section
 * Wrapper de sección con header opcional (título + descripción) y contenido.
 * Mantiene spacing consistente.
 *
 * @example
 * ```tsx
 * <Section title="Mis películas" description="Lista completa">
 *   <Card>Contenido</Card>
 * </Section>
 * ```
 */
export function Section({
  title,
  description,
  actions,
  children,
  className,
  disableAnimations = false,
}: SectionProps) {
  const headerContent = (
    <>
      {title && (
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </>
  );

  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {disableAnimations ? (
            <div className="space-y-1 flex-1">{headerContent}</div>
          ) : (
            <PageHeaderAnimated className="space-y-1 flex-1">
              {headerContent}
            </PageHeaderAnimated>
          )}
          {actions && (
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      <div>{children}</div>
    </section>
  );
}


/* ========================================
   SectionGrid
   ======================================== */

export interface SectionGridProps {
  /**
   * Contenido del grid
   */
  children: React.ReactNode;
  /**
   * Número de columnas en desktop (default: 2)
   * Escala progresiva: 1 col (mobile) -> 2 col (md) -> N col (lg+)
   */
  cols?: 2 | 3 | 4;
  /**
   * Gap entre elementos
   */
  gap?: "sm" | "md" | "lg";
  /**
   * Clases adicionales
   */
  className?: string;
}

const gapClasses = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-5 lg:gap-6",
  lg: "gap-5 sm:gap-6 lg:gap-8",
} as const;

/**
 * SectionGrid
 * Grid responsivo para layouts de bloques.
 * Escala progresiva: 1 col (mobile) -> 2 col (md) -> N col (lg+)
 *
 * @example
 * ```tsx
 * <SectionGrid cols={3}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </SectionGrid>
 * ```
 */
export function SectionGrid({
  children,
  cols = 2,
  gap = "md",
  className,
}: SectionGridProps) {
  // Progresión: 1 col -> 2 col (md) -> N col (lg)
  const colsClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid grid-cols-1", gapClasses[gap], colsClass, className)}>
      {children}
    </div>
  );
}

