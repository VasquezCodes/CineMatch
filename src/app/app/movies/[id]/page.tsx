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
    <div className="flex flex-col min-h-screen">
      {/* 1. Backdrop Banner (Full Width) - SOLO DESKTOP/TABLET */}
      <MovieBackdrop 
        backdropUrl={movie.backdrop_url} 
        title={movie.title}
      >
        <div className="mb-0">
          <MovieBackButton />
        </div>
      </MovieBackdrop>

      {/* 2. Poster Section - SOLO MOBILE */}
      <div className="md:hidden relative w-full aspect-[2/3] max-h-[70vh] overflow-hidden">
        {movie.poster_url ? (
          <Image
            src={movie.poster_url}
            alt={movie.title}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
            <Film className="h-12 w-12 opacity-20" />
          </div>
        )}
        
        {/* Botón Volver sobre el poster en mobile */}
        <div className="absolute top-4 left-4 z-10">
          <MovieBackButton variant="light" />
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="relative">
        {/* Backdrop difuminado de fondo - SOLO MOBILE */}
        {movie.backdrop_url && (
          <div className="md:hidden absolute inset-0 z-0 overflow-hidden">
            <Image
              src={movie.backdrop_url}
              alt=""
              fill
              className="object-cover blur-[100px] opacity-30 scale-110 saturate-[1.4] brightness-[0.8] dark:brightness-[0.5]"
            />
            {/* Gradiente para integración */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background" />
          </div>
        )}

        <Container className="relative z-20 pt-20 md:pt-12 pb-16">
          <div className="grid grid-cols-1 gap-8 items-start">
            {/* MOBILE ONLY: Layout de dos columnas */}
            <div className="md:hidden grid grid-cols-[1fr_140px] gap-4">
              {/* Columna Izquierda: Contenido */}
              <div className="flex flex-col space-y-6">
                <div className="space-y-4">
                  {/* Título y Año */}
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold leading-tight text-foreground tracking-tight">
                      {movie.title}
                    </h1>
                    <div className="flex flex-col gap-1 text-base font-medium text-muted-foreground">
                      <span>{movie.year}</span>
                      {movie.director && (
                        <span>
                          Directed by <PersonLink name={movie.director} className="text-foreground hover:underline font-semibold" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Secundaria (Runtime, Watchlist) */}
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                    {technical?.runtime && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider text-[11px]">
                        {technical.runtime} mins
                      </span>
                    )}

                    {movie.watchlist && (
                      <div className="flex items-center gap-1.5 text-foreground/80">
                        <Bookmark className="h-3 w-3 fill-current" />
                        <span className="text-xs">En tu lista</span>
                      </div>
                    )}
                  </div>

                  {/* Ratings */}
                  {(movie.rating || movie.imdb_rating) && (
                    <div className="flex items-center gap-6 py-3 border-y border-border/50">
                      {movie.rating && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Tu valoración</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="text-lg font-bold text-foreground">{movie.rating}</span>
                          </div>
                        </div>
                      )}
                      {movie.imdb_rating && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">IMDb</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-star-yellow text-star-yellow" />
                            <span className="text-lg font-bold text-star-yellow">
                              {movie.imdb_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tagline */}
                  {technical?.tagline && (
                    <p className="text-sm italic text-muted-foreground border-l-4 border-primary/20 pl-3 py-1">
                      &quot;{technical.tagline}&quot;
                    </p>
                  )}

                  {/* Sinopsis */}
                  {movie.synopsis && (
                    <div className="space-y-2 pt-2">
                      <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Sinopsis</h2>
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {movie.synopsis}
                      </p>
                    </div>
                  )}

                  {/* Géneros */}
                  {movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 rounded-full text-xs font-semibold
                                    bg-secondary text-secondary-foreground border border-border/50
                                    hover:bg-secondary/80 transition-colors"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Poster Sticky */}
              <div className="sticky top-20 z-30">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-xl border border-black/10 dark:border-white/10 bg-muted">
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="140px"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                      <Film className="h-8 w-8 opacity-20" />
                    </div>
                  )}
                </div>

                {/* Watchlist Badge mobile */}
                {movie.watchlist && (
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-foreground/80 text-xs font-medium">
                    <Bookmark className="h-3 w-3 fill-current" />
                    <span>En tu lista</span>
                  </div>
                )}
              </div>
            </div>

            {/* DESKTOP: Layout actual sin cambios */}
            <div className="hidden md:grid md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
              {/* Columna Izquierda: Póster (Sticky) - SOLO DESKTOP/TABLET */}
              <div className="w-full max-w-[200px] md:max-w-none mx-auto md:mx-0 md:sticky md:top-24 z-30">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-2xl border border-black/10 dark:border-white/10 bg-muted">
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 200px, 300px"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                      <Film className="h-12 w-12 opacity-20" />
                    </div>
                  )}
                </div>

                {/* Watchlist Badge (Debajo del póster en desktop) */}
                {movie.watchlist && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-foreground/80 font-medium">
                    <Bookmark className="h-4 w-4 fill-current" />
                    <span>En tu lista</span>
                  </div>
                )}
              </div>

              {/* Columna Derecha: Información Principal */}
              <div className="flex flex-col space-y-6">
                <div className="space-y-4">
                  {/* Título y Año */}
                  <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground tracking-tight">
                      {movie.title}
                    </h1>
                    <div className="flex items-center gap-3 text-lg font-medium text-muted-foreground">
                      <span>{movie.year}</span>
                      {movie.director && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>
                            Directed by <PersonLink name={movie.director} className="text-foreground hover:underline font-semibold" />
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Metadata Secundaria (Runtime) */}
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                    {technical?.runtime && (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider text-[11px]">
                        {technical.runtime} mins
                      </span>
                    )}
                  </div>

                  {/* Ratings */}
                  {(movie.rating || movie.imdb_rating) && (
                    <div className="flex items-center gap-8 py-4 border-y border-border/50">
                      {movie.rating && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Tu valoración</span>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-5 w-5 fill-accent text-accent" />
                            <span className="text-xl font-bold text-foreground">{movie.rating}</span>
                          </div>
                        </div>
                      )}
                      {movie.imdb_rating && (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">IMDb</span>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-5 w-5 fill-star-yellow text-star-yellow" />
                            <span className="text-xl font-bold text-star-yellow">
                              {movie.imdb_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tagline */}
                  {technical?.tagline && (
                    <p className="text-lg italic text-muted-foreground border-l-4 border-primary/20 pl-4 py-1">
                      &quot;{technical.tagline}&quot;
                    </p>
                  )}

                  {/* Sinopsis */}
                  {movie.synopsis && (
                    <div className="space-y-3 pt-2">
                      <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground">Sinopsis</h2>
                      <p className="text-lg leading-relaxed text-foreground/90 max-w-4xl">
                        {movie.synopsis}
                      </p>
                    </div>
                  )}

                  {/* Géneros */}
                  {movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-4 py-1.5 rounded-full text-sm font-semibold
                                    bg-secondary text-secondary-foreground border border-border/50
                                    hover:bg-secondary/80 transition-colors"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Secciones Inferiores (Casting, Recomendaciones) */}
          <div className="mt-16 space-y-12 md:space-y-20">
            {(cast.length > 0 || crewDetails.length > 0) && (
              <div className="pt-8 border-t border-border/50">
                <MovieCast cast={cast} crew={crewDetails} />
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="pt-8 border-t border-border/50">
                <MovieRecommendations recommendations={recommendations} />
              </div>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}
