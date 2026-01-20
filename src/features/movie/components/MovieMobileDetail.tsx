import Image from "@/components/CloudinaryImage";
import { Film, Bookmark, Star } from "lucide-react";
import { PersonLink } from "@/components/shared/PersonLink";
import { MovieBackButton } from "./MovieBackButton";
import type { MovieDetail } from "../actions";

type MovieMobileDetailProps = {
  movie: MovieDetail;
};

export function MovieMobileDetail({ movie }: MovieMobileDetailProps) {
  const technical = movie.extended_data?.technical;

  return (
    <div className="md:hidden relative -mx-4 sm:-mx-6 pb-8">
      {/* 1. Header: Póster de fondo que sube por debajo del navbar */}
      <div className="relative w-full h-[60vh] max-h-[650px] min-h-[450px] -mt-14 pt-14 overflow-hidden">
        {/* Póster de fondo */}
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50">
            <Film className="h-16 w-16 opacity-20" />
          </div>
        )}

        {/* Overlay adaptativo para legibilidad en light/dark mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-background dark:from-black/60 dark:via-black/30 dark:to-background z-[1]" />

        {/* Degradado inferior fuerte para transición */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/95 to-transparent z-[2]" />

        {/* Botón Volver - Sobre el póster */}
        <div className="absolute top-16 left-4 sm:left-6 z-20">
          <MovieBackButton variant="dark" />
        </div>
      </div>

      {/* 2. Bloque de Contenido Principal (Dos Columnas) */}
      <div className="relative z-10 px-4 sm:px-6 -mt-32 grid grid-cols-[1fr_130px] sm:grid-cols-[1fr_160px] gap-4 sm:gap-6">

        {/* Columna Izquierda: Información */}
        <div className="flex flex-col min-w-0 space-y-3">
          {/* Título */}
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-foreground tracking-tight line-clamp-3 drop-shadow-lg">
            {movie.title}
          </h1>

          {/* Metadatos: Año y Director */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/90">{movie.year}</span>
            <span className="opacity-40">•</span>
            <span className="flex items-center gap-1">
              Directed by <PersonLink name={movie.director || ""} className="text-foreground hover:underline font-medium" />
            </span>
          </div>

          {/* Duración */}
          {technical?.runtime && (
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {technical.runtime} MINS
            </div>
          )}

          {/* Watchlist Indicator */}
          {movie.watchlist && (
            <div className="flex items-center gap-1.5 text-foreground pt-1">
              <Bookmark className="h-4 w-4 fill-current text-primary" />
              <span className="text-sm font-medium">En tu lista</span>
            </div>
          )}
        </div>

        {/* Columna Derecha: Póster Flotante */}
        <div className="relative">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-2xl border border-border/20 bg-muted">
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 130px, 160px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Film className="h-8 w-8 opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Sección Inferior: Ratings, Tagline y Sinopsis */}
      <div className="relative z-10 px-4 sm:px-6 mt-6 space-y-6">

        {/* Ratings */}
        {(movie.imdb_rating || movie.personalRating || movie.rating) && (
          <div className="flex items-center gap-6 pb-4 border-b border-border/20">
            {/* IMDB Rating */}
            {movie.imdb_rating && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">IMDb</span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-xl font-bold text-foreground">{movie.imdb_rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>
            )}

            {/* Personal Rating */}
            {(movie.personalRating || movie.rating) && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tu Valoración</span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    {(movie.personalRating || movie.rating)?.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tagline */}
        {technical?.tagline && (
          <p className="text-sm italic text-muted-foreground border-l-2 border-primary/50 pl-3 py-1">
            &quot;{technical.tagline}&quot;
          </p>
        )}

        {/* Sinopsis */}
        {movie.synopsis && (
          <p className="text-[15px] leading-relaxed text-foreground/85 font-light">
            {movie.synopsis}
          </p>
        )}
      </div>
    </div>
  );
}