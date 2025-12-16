import * as React from "react";
import { cn } from "@/lib/utils/cn";

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
}

/**
 * Section
 * Wrapper de sección con header opcional (título + descripción) y contenido.
 * Mantiene spacing consistente.
 *
 * @example
 * ```tsx
 * <Section title="Mis películas" description="Lista completa">
 *   <SectionCard>Contenido</SectionCard>
 * </Section>
 * ```
 */
export function Section({
  title,
  description,
  actions,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 flex-1">
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
          </div>
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
   SectionCard
   ======================================== */

export interface SectionCardProps {
  /**
   * Contenido de la card
   */
  children: React.ReactNode;
  /**
   * Clases adicionales
   */
  className?: string;
}

/**
 * SectionCard
 * Wrapper con bg-card, border y shadow para bloques de contenido.
 * Alternativa simple a Card de shadcn cuando no se necesita CardHeader/CardContent.
 *
 * @example
 * ```tsx
 * <SectionCard>
 *   <p>Contenido del bloque</p>
 * </SectionCard>
 * ```
 */
export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
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
   */
  cols?: 2 | 3 | 4;
  /**
   * Clases adicionales
   */
  className?: string;
}

/**
 * SectionGrid
 * Grid responsivo para layouts de bloques.
 * 1 columna en mobile, N columnas en lg+ según prop cols.
 *
 * @example
 * ```tsx
 * <SectionGrid cols={3}>
 *   <SectionCard>Item 1</SectionCard>
 *   <SectionCard>Item 2</SectionCard>
 *   <SectionCard>Item 3</SectionCard>
 * </SectionGrid>
 * ```
 */
export function SectionGrid({
  children,
  cols = 2,
  className,
}: SectionGridProps) {
  const colsClass = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  }[cols];

  return (
    <div className={cn("grid grid-cols-1 gap-6", colsClass, className)}>
      {children}
    </div>
  );
}

