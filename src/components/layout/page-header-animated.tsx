"use client";

import * as React from "react";
import { TextRevealGroup } from "@/components/animations/TextRevealGroup";

interface PageHeaderAnimatedProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageHeaderAnimated
 * Client component que envuelve el contenido del header con animaciones.
 * Separado para permitir que PageHeader sea un Server Component.
 */
export function PageHeaderAnimated({ children, className }: PageHeaderAnimatedProps) {
  return (
    <TextRevealGroup as="div" className={className}>
      {children}
    </TextRevealGroup>
  );
}
