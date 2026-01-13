import Image from "@/components/CloudinaryImage";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Film, Bookmark, Clock } from "lucide-react";
import {
  getMovie,
  MovieBackButton,
  MovieTechnicalInfo,
  MovieCast,
  MovieRecommendations
} from "@/features/movie";
import { PersonLink } from "@/components/shared/PersonLink";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    notFound();
  }

  const technical = movie.extended_data?.technical;
  const cast = movie.extended_data?.cast || [];
  const crewDetails = movie.extended_data?.crew_details || [];
  const recommendations = movie.extended_data?.recommendations || [];

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Botón volver */}
      <div>
        <MovieBackButton />
      </div>

      {/* Layout con póster y contenido */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 lg:gap-8">
        {/* Póster al lado izquierdo */}
        <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-none mx-auto md:mx-0">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-lg border border-border/40 bg-muted md:sticky md:top-20">
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 280px, 320px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                <Film className="h-16 w-16 opacity-20" />
              </div>
            )}
          </div>
        </div>

        {/* Contenido del lado derecho */}
        <div className="flex flex-col space-y-8">
          {/* Título, Año y Badges */}
          <div className="pb-6 border-b border-border/50">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                {movie.title}
              </h1>
              <div className="flex flex-col gap-2 shrink-0">
                {movie.rating && (
                  <Badge
                    variant="outline"
                    className="text-sm px-3 py-1.5 gap-1.5"
                    title="Tu valoración (review)"
                  >
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-semibold">{movie.rating}</span>
                  </Badge>
                )}
                {movie.watchlist && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 gap-1"
                    title="En tu lista"
                  >
                    <Bookmark className="h-3 w-3 fill-current" />
                    <span>En lista</span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-lg font-medium">{movie.year}</span>
              </div>

              {movie.imdb_rating && (
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 gap-1.5 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/20"
                  title="IMDb Rating"
                >
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold">{movie.imdb_rating.toFixed(1)}</span>
                  <span className="text-xs opacity-80 font-normal">IMDb</span>
                </Badge>
              )}

              {movie.personalRating && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-base font-bold text-primary">{movie.personalRating}</span>
                  <span className="text-xs text-muted-foreground ml-1">personal</span>
                </div>
              )}
            </div>

            {/* Director */}
            {movie.director && (
              <p className="text-base text-foreground/80">
                <span className="font-medium">Dirigida por:</span>{" "}
                <PersonLink
                  name={movie.director}
                  className="text-foreground font-medium"
                />
              </p>
            )}
          </div>

          {/* Información Técnica */}
          <MovieTechnicalInfo
            runtime={technical?.runtime}
            genres={movie.genres}
            tagline={technical?.tagline}
          />

          {/* Sinopsis */}
          {movie.synopsis && (
            <div>
              <h2 className="text-2xl font-bold mb-3">Sinopsis</h2>
              <p className="text-base text-foreground/90 leading-relaxed">
                {movie.synopsis}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reparto y Equipo */}
      {(cast.length > 0 || crewDetails.length > 0) && (
        <MovieCast cast={cast} crew={crewDetails} />
      )}

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <MovieRecommendations recommendations={recommendations} />
      )}
    </div>
  );
}
