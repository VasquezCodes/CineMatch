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
        <div className="flex flex-col space-y-6">
          {/* Título */}
          <div className="pb-4 border-b border-border/50">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
              {movie.title}
            </h1>

            {/* Año y Estado */}
            <div className="flex items-center gap-4 mb-4 flex-wrap text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-base font-medium">{movie.year}</span>
              </div>

              {movie.watchlist && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 fill-current" />
                    <span className="text-base font-medium">En tu lista</span>
                  </div>
                </>
              )}
            </div>

            {/* Card de valoraciones */}
            {(movie.rating || movie.imdb_rating) && (
              <div className="bg-muted/40 border border-border/60 rounded-lg p-4 mb-4">
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {movie.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tu valoración:</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-semibold text-base">{movie.rating}</span>
                      </div>
                    </div>
                  )}

                  {movie.imdb_rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">IMDb:</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-star-yellow text-star-yellow" />
                        <span className="font-semibold text-base text-star-yellow">
                          {movie.imdb_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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

          {/* Reparto y Equipo */}
          {(cast.length > 0 || crewDetails.length > 0) && (
            <MovieCast cast={cast} crew={crewDetails} />
          )}

          {/* Recomendaciones */}
          {recommendations.length > 0 && (
            <MovieRecommendations recommendations={recommendations} />
          )}
        </div>
      </div>
    </div>
  );
}
