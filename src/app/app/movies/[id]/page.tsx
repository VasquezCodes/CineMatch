import Image from "@/components/CloudinaryImage";
import { notFound } from "next/navigation";
import { Calendar, Star, Film, Bookmark } from "lucide-react";
import {
  getMovie,
  MovieBackButton,
  MovieBackdrop,
  MovieCast,
  MovieRecommendations
} from "@/features/movie";
import { PersonLink } from "@/components/shared/PersonLink";
import { Container } from "@/components/layout";

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
    <div className="flex flex-col">
      {/* Hero Section con Backdrop Full-Width */}
      <MovieBackdrop backdropUrl={movie.backdrop_url} title={movie.title}>
        {/* Botón volver - Posicionado absolutamente en la esquina superior */}
        <div className="mb-6">
          <MovieBackButton />
        </div>

        {/* Grid con póster e información */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6 lg:gap-8 items-end">
          {/* Póster */}
          <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-none mx-auto md:mx-0">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-muted">
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

          {/* Información principal sobre el backdrop */}
          <div className="flex flex-col justify-end space-y-4 text-white">
            {/* Título */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
              {movie.title}
            </h1>

            {/* Año y Estado */}
            <div className="flex items-center gap-4 flex-wrap text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-base font-medium">{movie.year}</span>
              </div>

              {movie.watchlist && (
                <>
                  <span className="text-white/40">•</span>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 fill-current" />
                    <span className="text-base font-medium">En tu lista</span>
                  </div>
                </>
              )}
            </div>

            {/* Valoraciones */}
            {(movie.rating || movie.imdb_rating) && (
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {movie.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80">Tu valoración:</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-accent text-accent" />
                      <span className="font-semibold text-lg">{movie.rating}</span>
                    </div>
                  </div>
                )}

                {movie.imdb_rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80">IMDb:</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-star-yellow text-star-yellow" />
                      <span className="font-semibold text-lg text-star-yellow">
                        {movie.imdb_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Director y duración */}
            <div className="flex flex-wrap items-center gap-4 text-base text-white/90">
              {movie.director && (
                <div>
                  <span className="font-medium">Dirigida por:</span>{" "}
                  <PersonLink
                    name={movie.director}
                    className="text-white font-semibold hover:text-white/80"
                  />
                </div>
              )}

              {movie.director && technical?.runtime && (
                <span className="text-white/40">•</span>
              )}

              {technical?.runtime && (
                <span className="font-medium">{technical.runtime} minutos</span>
              )}
            </div>

            {/* Géneros */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full text-sm font-medium 
                                bg-white/20 border-white/30 text-white
                                backdrop-blur-sm border"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Tagline */}
            {technical?.tagline && (
              <p className="text-base italic text-white/80 border-white/30 border-l-2 pl-4">
                &quot;{technical.tagline}&quot;
              </p>
            )}
          </div>
        </div>
      </MovieBackdrop>

      {/* Contenido debajo del hero - Envuelto en Container con padding superior */}
      <Container className="py-8 md:py-12">
        <div className="space-y-8 md:space-y-10">
          {/* Sinopsis */}
          {movie.synopsis && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Sinopsis</h2>
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
      </Container>
    </div>
  );
}
