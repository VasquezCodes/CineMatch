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
      {/* Layout Mobile (< md) */}
        <div className="md:hidden flex flex-col">
          {/* 1. Backdrop Banner Top */}
          <MovieBackdrop 
            backdropUrl={movie.backdrop_url} 
            title={movie.title}
            className="min-h-[40vh] md:min-h-[600px]"
          >
             {/* Botón volver mobile inside banner */}
            <div className="mb-0">
               <MovieBackButton />
            </div>
          </MovieBackdrop>

          {/* 2. Main Content Below Backdrop */}
          <Container className="relative z-20 pt-6 pb-10">
            <div className="grid grid-cols-[1fr_100px] gap-4 items-start">
               {/* Columna Izquierda: Info */}
              <div className="flex flex-col space-y-3 pt-2">
                 {/* Título */}
                <h1 className="text-2xl font-bold leading-tight text-foreground">
                  {movie.title}
                </h1>

                {/* Metadata */}
                <div className="flex flex-col gap-1 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-foreground/90">{movie.year}</span>
                    {movie.director && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="truncate text-foreground/90">
                          Directed by {movie.director}
                        </span>
                      </>
                    )}
                  </div>
                   {technical?.runtime && (
                     <div className="text-muted-foreground text-xs uppercase tracking-wider">
                       {technical.runtime} mins
                     </div>
                  )}
                   
                   {/* Watchlist - Estilo igual a Desktop (Texto simple) */}
                   {movie.watchlist && (
                    <div className="flex items-center gap-2 pt-1 text-foreground/90">
                      <Bookmark className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">En tu lista</span>
                    </div>
                  )}
                </div>
              </div>

               {/* Columna Derecha: Póster Sticky */}
               <div className="relative z-10 min-h-full">
                  <div className="sticky top-20 w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 bg-muted">
                    {movie.poster_url ? (
                      <Image
                        src={movie.poster_url}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="100px"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                        <Film className="h-6 w-6 opacity-20" />
                      </div>
                    )}
                  </div>
               </div>
            </div>
            
            {/* Contenido Full Width Debajo de las columnas (Sinopsis, Ratings, Tagline) */}
             <div className="mt-6 flex flex-col space-y-6">
                 {/* Tagline */}
                 {technical?.tagline && (
                    <p className="text-sm italic text-muted-foreground border-l-2 border-primary/50 pl-3">
                      &quot;{technical.tagline}&quot;
                    </p>
                 )}

                 {/* Sinopsis */}
                 {movie.synopsis && (
                   <div className="space-y-2">
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {movie.synopsis}
                      </p>
                   </div>
                 )}

                 {/* Ratings */}
                 {(movie.rating || movie.imdb_rating) && (
                    <div className="flex items-center gap-6 py-4 border-t border-border border-b">
                       {movie.rating && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating</span>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="font-semibold text-foreground">{movie.rating}</span>
                          </div>
                        </div>
                      )}
                      {movie.imdb_rating && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">IMDb</span>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-star-yellow text-star-yellow" />
                            <span className="font-semibold text-star-yellow">
                              {movie.imdb_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                 )}

                  {/* Géneros */}
                  {movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-2.5 py-1 rounded-md text-xs font-medium 
                                      bg-secondary text-secondary-foreground border border-border"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
             </div>
          </Container>
        </div>

        {/* Layout Desktop (>= md) - Se mantiene el original */}
        <div className="hidden md:flex flex-col">
          <MovieBackdrop backdropUrl={movie.backdrop_url} title={movie.title}>
            {/* Botón volver - Posicionado absolutamente en la esquina superior */}
            <div className="mb-6">
              <MovieBackButton />
            </div>

            {/* Grid con póster e información */}
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-start">
          {/* Póster - Sticky on desktop */}
          <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-none mx-auto md:mx-0 md:sticky md:top-24">
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

          {/* Información principal + Sinopsis sobre el backdrop */}
          <div className="flex flex-col space-y-8 text-white drop-shadow-md">
            <div className="space-y-4">
              {/* Título */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-2xl">
                {movie.title}
              </h1>

              {/* Año y Estado */}
              <div className="flex items-center gap-4 flex-wrap text-white font-medium drop-shadow-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-base">{movie.year}</span>
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
                <div className="flex flex-wrap gap-x-6 gap-y-3 drop-shadow-lg">
                  {movie.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/90 font-medium">Tu valoración:</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-5 w-5 fill-accent text-accent" />
                        <span className="font-semibold text-lg">{movie.rating}</span>
                      </div>
                    </div>
                  )}

                  {movie.imdb_rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/90 font-medium">IMDb:</span>
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
              <div className="flex flex-wrap items-center gap-4 text-base text-white/95 font-medium drop-shadow-lg">
                {movie.director && (
                  <div>
                    <span className="opacity-90">Dirigida por:</span>{" "}
                    <PersonLink
                      name={movie.director}
                      className="text-white font-bold hover:underline"
                    />
                  </div>
                )}

                {movie.director && technical?.runtime && (
                  <span className="text-white/60">•</span>
                )}

                {technical?.runtime && (
                  <span>{technical.runtime} minutos</span>
                )}
              </div>

              {/* Géneros */}
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 drop-shadow-lg">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full text-sm font-semibold 
                                  bg-white/20 border-white/40 text-white
                                  backdrop-blur-md border shadow-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Tagline */}
              {technical?.tagline && (
                <p className="text-base italic text-white/90 border-white/40 border-l-2 pl-4 drop-shadow-lg font-medium">
                  &quot;{technical.tagline}&quot;
                </p>
              )}
            </div>

            {/* Sinopsis integrada en el grid para permitir el sticky del póster */}
            {movie.synopsis && (
              <div className="pt-4 border-t border-white/10 drop-shadow-lg">
                <h2 className="text-xl font-bold mb-3 text-white">Sinopsis</h2>
                <p className="text-lg text-white font-medium leading-relaxed max-w-4xl opacity-95">
                  {movie.synopsis}
                </p>
              </div>
            )}
          </div>
        </div>
       </MovieBackdrop>
      </div>

      {/* Contenido debajo del hero - Reparto y Recomendaciones permanecen igual */}
      <Container className="py-8 md:py-12">
        <div className="space-y-8 md:space-y-10">
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
