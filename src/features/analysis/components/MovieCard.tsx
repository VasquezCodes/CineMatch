import Link from "next/link";
import { CloudinaryImage } from "@/components/shared/CloudinaryImage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { WatchlistAnalysisItem } from "../types";

interface MovieCardProps {
  item: WatchlistAnalysisItem;
}

export function MovieCard({ item }: MovieCardProps) {
  const { movie, watchlist } = item;

  return (
    <Link href={`/app/movies/${movie.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-md hover:border-accent transition-all cursor-pointer">
        <div className="flex gap-3 p-4">
          {/* Poster */}
          <div className="relative w-20 h-28 shrink-0 rounded-md overflow-hidden bg-muted">
            {movie.poster_url ? (
              <CloudinaryImage
                src={movie.poster_url}
                alt={movie.title || "Movie poster"}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-xs">Sin poster</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
              {movie.title || "Sin título"}
            </h3>

            {movie.year && (
              <p className="text-xs text-muted-foreground">{movie.year}</p>
            )}

            {movie.director && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                Dir: {movie.director}
              </p>
            )}

            {/* Rating del usuario */}
            {watchlist.user_rating !== null && (
              <div className="flex items-center gap-1 pt-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-sm font-medium">
                  {(item.watchlist.user_rating || 0).toFixed(1)}
                </span>
              </div>
            )}

            {/* Rating IMDb */}
            {movie.imdb_rating && (
              <div className="text-xs text-muted-foreground">
                IMDb: {movie.imdb_rating.toFixed(1)}
              </div>
            )}

            {/* Géneros */}
            {movie.genres && Array.isArray(movie.genres) && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(movie.genres as string[]).slice(0, 2).map((genre) => (
                  <Badge
                    key={genre}
                    variant="accent"
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
