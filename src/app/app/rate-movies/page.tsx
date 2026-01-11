import { redirect } from "next/navigation";
import { PageHeader, Section } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { getWatchlistAnalysis } from "@/features/analysis/actions";
import { FastRankingGrid } from "@/features/reviews";
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
      // Mapear a formato UnratedMovie (incluimos todas para el modo rápido con filtros)
      unratedMovies = result.data.map((item) => ({
        watchlistId: item.watchlist.id,
        movieId: item.movie.id,
        imdbId: item.movie.imdb_id,
        title: item.movie.title || "Título desconocido",
        year: item.movie.year,
        posterUrl: item.movie.poster_url,
        currentRating: item.watchlist.rating,
      }));

      // Si no hay películas en el watchlist
      if (unratedMovies.length === 0) {
        shouldRedirect = true;
      }
    }
  } catch (err) {
    console.error("Error loading unrated movies:", err);
    error = "Error al cargar las películas";
  }

  if (shouldRedirect) {
    redirect(APP_ROUTES.UPLOAD);
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
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Modo Rápido de Calificación"
        description="Califica tu colección con un solo clic para generar tu perfil cinéfilo."
      />

      <FastRankingGrid movies={unratedMovies} />
    </div>
  );
}
