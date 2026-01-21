import Image from "@/components/CloudinaryImage";
import { ReactNode } from "react";
import { Container } from "@/components/layout";

import { cn } from "@/lib/utils";

type MovieBackdropProps = {
  backdropUrl: string | null;
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * MovieBackdrop
 * Componente estilo Letterboxd con backdrop de película.
 * - Imagen full-width con object-cover (llena todo el espacio)
 * - Vignettes laterales fuertes que ocultan los bordes
 * - Gradiente inferior para transición al contenido
 */
export function MovieBackdrop({
  backdropUrl,
  title,
  children,
  className,
}: MovieBackdropProps) {
  // Color de fondo igual que la página
  const bgColor = "hsl(var(--background))";

  return (
    <div className={cn(
      "relative w-full overflow-hidden bg-background",
      className
    )}>

      {/* Backdrop Image - Full width */}
      {backdropUrl && backdropUrl !== "" && (
        <div className="relative w-full h-[480px] lg:h-[580px] xl:h-[650px]">
          {/* Imagen principal - llena todo el espacio */}
          <Image
            src={backdropUrl}
            alt={`Backdrop de ${title}`}
            fill
            className="object-cover object-center"
            priority
            quality={90}
            sizes="100vw"
          />

          {/* === VIGNETTES FUERTES ESTILO LETTERBOXD === */}

          {/* Vignette izquierdo - más ancho y fuerte */}
          <div
            className="absolute inset-y-0 left-0 w-[25%] pointer-events-none"
            style={{
              background: `linear-gradient(to right, ${bgColor} 0%, ${bgColor} 20%, transparent 100%)`
            }}
          />

          {/* Vignette derecho - más ancho y fuerte */}
          <div
            className="absolute inset-y-0 right-0 w-[25%] pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${bgColor} 0%, ${bgColor} 20%, transparent 100%)`
            }}
          />

          {/* Gradiente inferior - más suave y largo */}
          <div
            className="absolute inset-x-0 bottom-0 h-[50%] pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${bgColor} 0%, ${bgColor} 30%, transparent 100%)`
            }}
          />

          {/* Gradiente superior suave para el navbar */}
          <div
            className="absolute inset-x-0 top-0 h-20 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${bgColor} 0%, transparent 100%)`
            }}
          />
        </div>
      )}

      {/* Contenido (botón volver) - posicionado absolutamente sobre el backdrop */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-4 md:pt-8">
        <Container>
          {children}
        </Container>
      </div>
    </div>
  );
}

// Exportamos con alias para compatibilidad con imports existentes
export { MovieBackdrop as MovieHero };
