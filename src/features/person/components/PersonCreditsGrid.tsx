import Image from 'next/image';
import Link from 'next/link';
import { Film } from 'lucide-react';
import type { MovieCredit } from '../types';

type PersonCreditsGridProps = {
  movies: MovieCredit[];
};

export function PersonCreditsGrid({ movies }: PersonCreditsGridProps) {
  if (movies.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        No hay películas disponibles en esta categoría.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie, index) => (
        <Link
          key={`${movie.id}-${movie.title}-${index}`}
          href={`/app/movies/${movie.id}`}
          className="group flex flex-col"
        >
          {/* Póster */}
          <div className="relative aspect-[2/3] w-full mb-2 overflow-hidden rounded-lg bg-muted border border-border/40 transition-transform group-hover:scale-105">
            {movie.poster_path ? (
              <Image
                src={movie.poster_path}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                <Film className="h-8 w-8 opacity-30" />
              </div>
            )}
          </div>

          {/* Información */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {movie.release_year}
            </p>
            {movie.character && (
              <p className="text-xs text-muted-foreground/80 line-clamp-1">
                como {movie.character}
              </p>
            )}
            {movie.job && (
              <p className="text-xs text-muted-foreground/80 line-clamp-1">
                {movie.job}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
