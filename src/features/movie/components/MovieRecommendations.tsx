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
      <h2 className="text-2xl font-bold mb-4">Si te gustó esta película te puede gustar...</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {recommendations.map((movie) => (
          <Link
            key={movie.tmdb_id}
            href={`/app/movies/${movie.tmdb_id}`}
            className="group flex flex-col"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md border border-border/20 bg-muted transition-transform hover:scale-[1.02]">
              {movie.poster ? (
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16vw, 14vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                  <Film className="h-6 w-6 opacity-20" />
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
