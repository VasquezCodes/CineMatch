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
      {/* Hero: Imagen 100% width */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-muted">
        {posterUrl ? (
          <>
            {/* Imagen principal */}
            <Image
              src={decodeURIComponent(posterUrl)}
              alt={title}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay gradient para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
            <Film className="h-24 w-24 opacity-20" />
          </div>
        )}

        {/* Botón volver - Floating */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6">
          <Button
            onClick={handleBack}
            variant="secondary"
            size="sm"
            className="bg-background/80 backdrop-blur-sm hover:bg-background/95 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Rating badge - Floating */}
        {rating && (
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm text-base px-3 py-1.5 gap-1.5"
            >
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-bold">{rating}</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Título y Año */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-6 border-b border-border/50">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-lg font-medium">{year}</span>
            </div>
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
        <div className="space-y-6">
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-8">
            <p className="text-sm text-muted-foreground text-center">
              Más información de la película estará disponible próximamente
            </p>
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
