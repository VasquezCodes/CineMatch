import Image from "next/image";
import Link from "next/link";
import { Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Recommendation = {
  id: number;
  tmdb_id: number;
  title: string;
  year: number;
  poster: string | null;
};

type MovieRecommendationsProps = {
  recommendations: Recommendation[];
};

export function MovieRecommendations({
  recommendations,
}: MovieRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Películas Recomendadas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recommendations.map((movie) => (
          <Link
            key={movie.tmdb_id}
            href={`/app/movies/${movie.tmdb_id}`}
            className="group flex flex-col"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-md border border-border/40 bg-muted transition-all group-hover:shadow-lg group-hover:scale-105">
              {movie.poster ? (
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                  <Film className="h-12 w-12 opacity-20" />
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {movie.title}
              </p>
              {movie.year > 0 && (
                <Badge variant="outline" className="text-xs mt-1">
                  {movie.year}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
