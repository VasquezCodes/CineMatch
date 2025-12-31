import { redirect } from "next/navigation";
import { PageHeader, Section } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { getWatchlistAnalysis } from "@/features/analysis/actions";
import { RateMoviesGrid } from "@/features/reviews";
import type { UnratedMovie } from "@/features/reviews";
import { BarChart3 } from "lucide-react";

export default async function RateMoviesPage() {
  let unratedMovies: UnratedMovie[] = [];
  let error: string | null = null;
  let shouldRedirect = false;

  try {
    // Obtener todas las películas del watchlist
    const result = await getWatchlistAnalysis();

    if (result.error) {
      error = result.error;
    } else if (result.data) {
      // Filtrar solo las películas sin calificar
      const unrated = result.data.filter(
        (item) => item.watchlist.user_rating === null
      );

      // Si todas están calificadas, redirigir directamente al análisis
      if (unrated.length === 0) {
        shouldRedirect = true;
      } else {
        // Mapear a formato UnratedMovie
        unratedMovies = unrated.map((item) => ({
          watchlistId: item.watchlist.id,
          movieId: item.movie.id,
          imdbId: item.movie.imdb_id,
          title: item.movie.title || "Título desconocido",
          year: item.movie.year,
          posterUrl: item.movie.poster_url,
          currentRating: item.watchlist.user_rating,
        }));
      }
    }
  } catch (err) {
    console.error("Error loading unrated movies:", err);
    error = "Error al cargar las películas";
  }

  if (shouldRedirect) {
    redirect(APP_ROUTES.ANALYSIS);
  }

  // Estado de error
  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Califica tus películas"
          description="Algo salió mal al cargar las películas."
        />
        <Section>
          <ErrorState
            title="Error al cargar las películas"
            description={error}
            action={
              <Button asChild>
                <Link href={APP_ROUTES.UPLOAD}>Volver a subir</Link>
              </Button>
            }
          />
        </Section>
      </div>
    );
  }

  // Render principal
  return (
    <div className="space-y-8">
      <PageHeader
        title="Califica tus películas"
        description="Necesitas calificar estas películas antes de ver tu análisis completo. Seleccioná las estrellas para calificar cada película del 1 al 10."
      />

      {/* Botón para ver análisis completo */}
      <Section>
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link
              href={APP_ROUTES.ANALYSIS}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Ver análisis completo
            </Link>
          </Button>
        </div>
      </Section>

      <Section>
        <RateMoviesGrid movies={unratedMovies} />
      </Section>
    </div>
  );
}
