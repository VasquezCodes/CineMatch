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
    <div className={cn(
      // En mobile: sin altura fija, solo muestra el botón "Volver"
      // En desktop/tablet: altura fija con backdrop hero
      "relative w-full md:h-[650px] overflow-hidden bg-background",
      className
    )}>
      {/* Backdrop Image Container - SOLO EN DESKTOP/TABLET */}
      {backdropUrl && backdropUrl !== "" && (
        <>
          {/* Layer 1: Ambient Glow (The immersive "Pro" background) */}
          <div className="hidden md:block absolute inset-0 z-0 overflow-hidden">
            <Image
              src={backdropUrl}
              alt=""
              fill
              className="object-cover blur-[100px] md:blur-[150px] opacity-50 scale-110 saturate-[1.6] brightness-[0.7] dark:brightness-[0.4]"
              priority
            />
          </div>

          {/* Layer 2: Main sharp image with immersive fade edges & Grain */}
          <div className="hidden md:flex absolute inset-0 z-[1] items-center justify-center">
            <div className="relative w-full h-full bg-noise">
              <Image
                src={backdropUrl}
                alt={`Backdrop de ${title}`}
                fill
                className="object-cover object-top md:object-center brightness-[1] saturate-[1.1] dark:brightness-[0.85] dark:saturate-100 transition-all duration-1000"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                }}
                priority
                quality={100}
              />
              
              {/* Extra gradient overlays for seamless integration and readability */}
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-100" />
               <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-transparent" />
            </div>
          </div>
        </>
      )}

      {/* Contenido dentro de la caja */}
      <div className="relative z-10 w-full h-full pt-4 md:pt-16 pb-4">
        <Container>
          {children}
        </Container>
      </div>
    </div>
  );
}

// Exportamos con alias para compatibilidad con imports existentes
export { MovieBackdrop as MovieHero };
