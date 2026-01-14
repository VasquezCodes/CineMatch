"use client";

import Image from "@/components/CloudinaryImage";
import Link from "next/link";
import { Star, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LibraryItem } from "../types";

interface MovieCardProps {
  item: LibraryItem;
}

export function MovieCard({ item }: MovieCardProps) {
  const { movie, watchlist } = item;

  return (
    <Link href={`/app/movies/${movie.id}`} className="block group h-full">
      <Card className="relative overflow-hidden bg-card/50 border-accent/30 hover:border-accent transition-all duration-500 h-full shadow-none">
        <div className="grid grid-cols-[140px_1fr] h-full">
          <div className="relative overflow-hidden border-r border-accent/40">
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title || "Movie poster"}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="140px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] uppercase tracking-widest text-muted-foreground">
                No Art
              </div>
            )}
          </div>

          <div className="flex flex-col p-4 sm:p-5">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-medium text-sm sm:text-base tracking-tight text-card-foreground line-clamp-1">
                  {movie.title || "Sin título"}
                </h3>
                {movie.year && (
                  <span className="text-[10px] font-medium text-muted-foreground mt-1">
                    {movie.year}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                {watchlist.user_rating != null && (
                  <div className="flex items-center gap-1 text-star-yellow">
                    <Star className="h-2.5 w-2.5 fill-star-yellow" />
                    <span className="text-[10px] font-medium">
                      {watchlist.user_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                  {movie.genres && (movie.genres as string[])[0]}
                </span>
              </div>

              {movie.overview && (
                <p className="text-[12px] text-foreground/90 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4 font-light">
                  {movie.overview}
                </p>
              )}

              <div className="flex flex-wrap gap-1">
                {movie.genres &&
                  Array.isArray(movie.genres) &&
                  (movie.genres as string[]).slice(0, 2).map((genre) => (
                    <Badge
                      key={genre}
                      variant="outline"
                      className="text-[9px] uppercase tracking-tighter px-1.5 py-0 bg-white text-gray-900 border-foreground/30 dark:border-border font-normal"
                    >
                      {genre}
                    </Badge>
                  ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-[11px] font-medium bg-accent text-accent-foreground border-accent hover:opacity-90 transition-opacity duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Cualificar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-accent hover:bg-accent/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
