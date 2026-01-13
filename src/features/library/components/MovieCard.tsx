import Image from "@/components/CloudinaryImage";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LibraryItem } from "../types";


interface MovieCardProps {
  item: LibraryItem;
}

/**
 * MovieCard
 * Card individual de película para la biblioteca.
 * Muestra poster, título, año, director, rating y géneros.
 */
export function MovieCard({ item }: MovieCardProps) {
  const { movie, watchlist } = item;

  return (
    <Link href={`/app/movies/${movie.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer h-full">
        <div className="flex gap-3 p-4">
          {/* Poster */}
          <div className="relative w-20 h-28 shrink-0 rounded-md overflow-hidden bg-muted">
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title || "Movie poster"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-xs text-center px-2">Sin poster</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {movie.title || "Sin título"}
            </h3>

            {movie.year && (
              <p className="text-xs text-muted-foreground">{movie.year}</p>
            )}



            {/* Rating del usuario */}
            {watchlist.user_rating != null && (
              <div className="flex items-center gap-1 pt-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm font-medium">
                  {watchlist.user_rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Géneros */}
            {movie.genres && Array.isArray(movie.genres) && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(movie.genres as string[]).slice(0, 2).map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
