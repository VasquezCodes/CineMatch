import { cn } from "@/lib/utils";

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Screen - Componente contenedor raíz para todas las pantallas de CineMatch
 * 
 * Proporciona:
 * - Ancho máximo responsivo y centrado
 * - Padding consistente (mobile-first)
 * - Espaciado vertical entre secciones
 * - Soporte automático light/dark mode vía CSS variables
 */
export function Screen({ children, className }: ScreenProps) {
  return (
    <main
      className={cn(
        // Layout base
        "min-h-screen w-full",
        
        // Colores del Design System
        "bg-background text-foreground",
        
        // Container responsivo centrado
        "mx-auto max-w-7xl",
        
        // Padding mobile-first
        "px-4 py-6",
        "sm:px-6 sm:py-8",
        "lg:px-8 lg:py-12",
        
        // Espaciado vertical entre hijos
        "space-y-6 sm:space-y-8",
        
        className
      )}
    >
      {children}
    </main>
  );
}

