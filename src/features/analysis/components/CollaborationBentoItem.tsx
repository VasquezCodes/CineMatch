"use client";

import { type Collaboration } from "@/features/analysis/collaborations/actions";
import { BentoGridItem } from "@/components/ui/bento-grid";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star } from "lucide-react";

// Subcomponente: Avatares superpuestos
function AvatarPair({ collab }: { collab: Collaboration }) {
  return (
    <div className="flex items-center -space-x-2" role="group" aria-label="Colaboradores">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage
                  src={`https://image.tmdb.org/t/p/w200${collab.person1.photo_url}`}
                  alt={`Foto de ${collab.person1.name}`}
                />
                <AvatarFallback>{collab.person1.name[0]}</AvatarFallback>
              </Avatar>
              <span className="sr-only">{collab.person1.name}, {collab.person1.role}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{collab.person1.name} ({collab.person1.role})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage
                  src={`https://image.tmdb.org/t/p/w200${collab.person2.photo_url}`}
                  alt={`Foto de ${collab.person2.name}`}
                />
                <AvatarFallback>{collab.person2.name[0]}</AvatarFallback>
              </Avatar>
              <span className="sr-only">{collab.person2.name}, {collab.person2.role}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{collab.person2.name} ({collab.person2.role})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Subcomponente: Grid de posters de películas
function MoviePosterGrid({ movies }: { movies: Collaboration["movies"] }) {
  // Limitar a máximo 3 películas para mantener compacto
  const displayMovies = movies.slice(0, 3);

  return (
    <div className="mt-1.5 pt-1.5 border-t border-border/50 overflow-hidden">
      <p id="featured-movies" className="text-xs text-muted-foreground mb-1.5">Películas destacadas:</p>
      <div
        className="flex gap-1.5 justify-start flex-nowrap"
        role="list"
        aria-labelledby="featured-movies"
      >
        {displayMovies.map((movie, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-14 sm:w-16 space-y-0.5 text-center"
            role="listitem"
          >
            <div className="relative aspect-[2/3] rounded overflow-hidden bg-muted">
              {movie.poster_url ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_url}`}
                  alt={`Poster de ${movie.title}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-1">
                  Sin poster
                </div>
              )}
            </div>
            <div
              className="flex items-center justify-center text-[10px] gap-0.5 text-card-foreground"
              aria-label={`Valoración: ${movie.user_rating} estrellas`}
            >
              <Star className="h-2 w-2 fill-primary text-primary" aria-hidden="true" />
              <span>{movie.user_rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente principal
export function CollaborationBentoItem({
  collab,
  index
}: {
  collab: Collaboration;
  index: number;
}) {
  return (
    <BentoGridItem
      header={
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap sm:flex-nowrap">
          <AvatarPair collab={collab} />
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary text-xs px-2 py-0.5 shrink-0"
            aria-label={`${collab.count} películas en colaboración`}
          >
            {collab.count} películas
          </Badge>
        </div>
      }
      title={
        <h3 className="font-medium text-sm line-clamp-1">
          {collab.person1.name} & {collab.person2.name}
        </h3>
      }
      description={
        <p className="text-xs text-muted-foreground line-clamp-1">
          {collab.person1.role} • {collab.person2.role}
        </p>
      }
    >
      <MoviePosterGrid movies={collab.movies} />
    </BentoGridItem>
  );
}
