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
      "relative w-full h-[350px] md:h-[550px] overflow-hidden bg-background",
      className
    )}>
      {/* Backdrop Image Container */}
      {backdropUrl && backdropUrl !== "" && (
        <>
          {/* Layer 1: Ambient Glow (The immersive "Pro" background) - Now much larger/spread out */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src={backdropUrl}
              alt=""
              fill
              className="object-cover blur-[80px] md:blur-[120px] opacity-60 scale-110 saturate-[1.5] brightness-[0.6] dark:brightness-[0.3]"
              priority
            />
          </div>

          {/* Layer 2: Main sharp image with cinematic fade edges & Grain */}
          <div className="absolute inset-0 z-[1] flex items-center justify-center">
            <div className="relative w-full h-full max-w-[1400px] mx-auto bg-noise">
              <Image
                src={backdropUrl}
                alt={`Backdrop de ${title}`}
                fill
                className="object-cover object-top md:object-center brightness-[0.9] saturate-[1.1] dark:brightness-[0.8] dark:saturate-100 transition-all duration-1000"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in'
                }}
                priority
                quality={100}
              />
              
              {/* Extra gradient overlay for text readability on top of image */}
               <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
               <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 md:from-background/50 md:to-background/50" />
            </div>
          </div>
        </>
      )}

      {/* Contenido dentro de la caja */}
      <div className="relative z-10 w-full h-full pt-24 md:pt-28 pb-4">
        <Container>
          {children}
        </Container>
      </div>
    </div>
  );
}

// Exportamos con alias para compatibilidad con imports existentes
export { MovieBackdrop as MovieHero };
