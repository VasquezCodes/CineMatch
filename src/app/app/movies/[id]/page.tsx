"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Star, Film } from "lucide-react";
import { Suspense } from "react";

function MovieDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener datos de query params (temporal hasta tener server action)
  const movieId = params.id as string;
  const title = searchParams.get("title") || "Película sin título";
  const year = searchParams.get("year") || "—";
  const posterUrl = searchParams.get("poster") || null;
  const rating = searchParams.get("rating") || null;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Contenido principal */}
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Botón volver */}
        <div className="mb-6">
          <Button onClick={handleBack} variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        {/* Layout con póster y contenido */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 md:gap-8">
          {/* Póster al lado izquierdo */}
          <div className="w-full max-w-[280px] md:max-w-none mx-auto md:mx-0">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-lg border border-border/40 bg-muted">
              {posterUrl ? (
                <Image
                  src={decodeURIComponent(posterUrl)}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, 320px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                  <Film className="h-16 w-16 opacity-20" />
                </div>
              )}
            </div>
          </div>

          {/* Contenido del lado derecho */}
          <div className="flex flex-col">
            {/* Título y Año */}
            <div className="mb-6 pb-6 border-b border-border/50">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  {title}
                </h1>
                {rating && (
                  <Badge
                    variant="secondary"
                    className="text-base px-3 py-1.5 gap-1.5 shrink-0"
                  >
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-bold">{rating}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-lg font-medium">{year}</span>
              </div>
            </div>

            {/* Dirigida por */}
            <div className="mb-8">
              <p className="text-base text-foreground/80">
                <span className="font-medium">Dirigida por:</span>{" "}
                <span className="text-muted-foreground italic">
                  Información próximamente disponible
                </span>
              </p>
            </div>

            {/* Placeholder para más información */}
            <div className="flex-1">
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-8">
                <p className="text-sm text-muted-foreground text-center">
                  Más información de la película estará disponible próximamente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MovieDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      }
    >
      <MovieDetailContent />
    </Suspense>
  );
}
