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
 * Componente full-width con backdrop de película estilo Letterboxd.
 * - Altura dinámica basada en el contenido
 * - Backdrop absoluto que escapa del container (100vw)
 * - Gradientes cinematográficos multi-capa con vignette lateral
 * - Contenido interno respeta el Container max-w-7xl
 */
export function MovieBackdrop({
  backdropUrl,
  title,
  children,
  className,
}: MovieBackdropProps) {
  return (
    <div className={cn("relative w-full h-auto min-h-[600px] -mt-14 overflow-x-hidden", className)}>
      {/* Backdrop absoluto full-width (escapa del container) */}
      {backdropUrl && backdropUrl !== "" && (
        <div className="absolute inset-0 w-screen left-1/2 -translate-x-1/2 overflow-hidden">
          {/* Imagen de backdrop con máscara de transparencia pura */}
          <div 
            className="absolute inset-0 z-0 overflow-hidden"
            style={{
              WebkitMaskImage: `
                linear-gradient(to bottom, 
                  black 0%, 
                  black 65%, 
                  transparent 100%
                ),
                linear-gradient(to right, 
                  transparent 0%, 
                  black 10%, 
                  black 90%, 
                  transparent 100%
                )
              `,
              maskImage: `
                linear-gradient(to bottom, 
                  black 0%, 
                  black 65%, 
                  transparent 100%
                ),
                linear-gradient(to right, 
                  transparent 0%, 
                  black 10%, 
                  black 90%, 
                  transparent 100%
                )
              `,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
          >
            <Image
              src={backdropUrl}
              alt={`Backdrop de ${title}`}
              fill
              className="object-cover object-center brightness-[0.7] saturate-[1.1] dark:brightness-[0.6] dark:saturate-100 transition-all duration-700"
              sizes="100vw"
              priority
              quality={90}
            />
          </div>

          {/* Viñeta superior sutil para legibilidad del Navbar */}
          <div className="absolute inset-0 z-[1] pointer-events-none
                         bg-gradient-to-b from-black/60 via-transparent to-transparent dark:from-black/80" />

          {/* Content Scrim - Oscurecimiento y desenfoque para legibilidad máxima */}
          <div 
            className="absolute inset-0 z-[1] pointer-events-none backdrop-blur-[2px]"
            style={{
              background: `linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)`,
            }}
          />

          {/* Gradiente inferior para transición con el contenido */}
          <div className="absolute inset-0 z-[1] pointer-events-none 
                         bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        </div>
      )}

      {/* Contenido dentro de Container - con padding superior compensado */}
      <Container className="relative z-10 pt-20 pb-6 md:pt-22 md:pb-8">
        {children}
      </Container>
    </div>
  );
}

// Exportamos con alias para compatibilidad con imports existentes
export { MovieBackdrop as MovieHero };
