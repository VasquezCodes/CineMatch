"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TextRevealGroup } from "@/components/animations/TextRevealGroup";

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
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <TextRevealGroup as="div" className="space-y-1 flex-1">
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
          </TextRevealGroup>
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
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
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

