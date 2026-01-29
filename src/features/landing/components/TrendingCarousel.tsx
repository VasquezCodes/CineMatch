"use client";

import { useEffect, useState } from "react";
import CloudinaryImage from "@/components/CloudinaryImage";
import { cn } from "@/lib/utils";

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
}

export function TrendingCarousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("/api/trending-movies?limit=12");
        const data = await response.json();
        setMovies(data.movies || []);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-8">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] w-[120px] animate-pulse rounded-lg bg-muted/30 sm:h-[220px] sm:w-[147px] md:h-[270px] md:w-[180px]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  // Duplicamos los movies para el efecto infinito
  const duplicatedMovies = [...movies, ...movies];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Gradientes para fade en los bordes */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-24 md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-24 md:w-32" />

      {/* Contenedor del carrusel */}
      <div className="flex animate-carousel">
        {duplicatedMovies.map((movie, index) => (
          <div
            key={`${movie.id}-${index}`}
            className="flex-shrink-0 px-2 sm:px-3"
          >
            <div
              className={cn(
                "group relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105",
                "h-[180px] w-[120px] sm:h-[220px] sm:w-[147px] md:h-[270px] md:w-[180px]"
              )}
            >
              <CloudinaryImage
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 120px, (max-width: 768px) 147px, 180px"
              />
              {/* Overlay con título en hover */}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="w-full truncate p-3 text-xs font-medium text-white sm:text-sm">
                  {movie.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
