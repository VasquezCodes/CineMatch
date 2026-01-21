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
    <Link href={`/app/movies/${movie.id}`} className="block group">
      <Card className="relative overflow-hidden border-border/40 transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex h-52 sm:h-48">
          <div className="relative w-28 sm:w-32 flex-shrink-0 overflow-hidden bg-muted">
            {movie.poster_url ? (
              <Image
                src={movie.poster_url}
                alt={movie.title || "Movie poster"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
                No Art
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 p-4 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                {watchlist.user_rating != null && (
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="text-xs font-bold leading-none">
                      {watchlist.user_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {movie.year || "N/A"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </div>

            <h3 className="font-semibold text-base leading-tight line-clamp-1 text-foreground group-hover:text-primary transition-colors">
              {movie.title || "Sin título"}
            </h3>

            {movie.overview && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1.5">
                {movie.overview}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mt-2">
              {movie.genres &&
                Array.isArray(movie.genres) &&
                (movie.genres as string[]).slice(0, 2).map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="text-[9px] uppercase tracking-normal px-1.5 py-0 font-medium bg-muted/50 text-muted-foreground border-none"
                  >
                    {genre}
                  </Badge>
                ))}
            </div>

            <div className="mt-auto pt-3">
              <Button
                size="sm"
                className="w-full h-8 text-[11px] font-bold bg-accent text-accent-foreground hover:bg-accent/90 border-none rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Cualificar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
