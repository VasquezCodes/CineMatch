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
          {/* Imagen de backdrop - colores vibrantes en ambos modos */}
          <div className="absolute inset-0 z-0">
            <Image
              src={backdropUrl}
              alt={`Backdrop de ${title}`}
              fill
              className="object-cover object-center brightness-100 saturate-100"
              sizes="100vw"
              priority
              quality={90}
            />
          </div>

          {/* Gradientes cinematográficos adaptativos según tema */}
          {/* Bottom fade - fundido hacia el fondo */}
          <div className="absolute inset-0 z-[1] 
                         dark:bg-gradient-to-b dark:from-transparent dark:via-black/20 dark:to-black/60
                         bg-gradient-to-b from-transparent via-black/10 to-transparent" />

          {/* Top vignette - oscurecimiento superior para navbar legible */}
          <div className="absolute inset-0 z-[1] 
                         bg-gradient-to-t from-transparent via-transparent to-black/40" />

          {/* Lateral vignette - funciona en ambos modos */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.5) 100%)",
            }}
          />

          {/* Overlay sutil para contraste del texto - solo dark mode */}
          <div className="absolute inset-0 z-[1] dark:bg-black/20 bg-transparent" />
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
