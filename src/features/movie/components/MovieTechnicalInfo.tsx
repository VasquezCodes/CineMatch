import { Badge } from "@/components/ui/badge";
import { Clock, Film } from "lucide-react";

type MovieTechnicalInfoProps = {
  runtime?: number;
  genres: string[];
  tagline?: string;
};

export function MovieTechnicalInfo({
  runtime,
  genres,
  tagline,
}: MovieTechnicalInfoProps) {
  return (
    <div className="space-y-4">
      {/* Géneros */}
      {genres.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Géneros
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="text-sm">
                <Film className="h-3 w-3 mr-1" />
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Duración */}
      {runtime && runtime > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Duración
          </h3>
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-base">{runtime} minutos</span>
          </div>
        </div>
      )}

      {/* Tagline */}
      {tagline && (
        <div>
          <p className="text-base italic text-muted-foreground border-l-2 border-primary/30 pl-4">
            "{tagline}"
          </p>
        </div>
      )}
    </div>
  );
}
