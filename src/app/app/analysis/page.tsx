import { redirect } from "next/navigation";
import { PageHeader, Section } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, AlertCircle, Star } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { getAnalysisData } from "@/features/insights/actions";
import { getWatchlistAnalysis } from "@/features/analysis/actions";
import { AnalysisStats } from "@/features/analysis/components/AnalysisStats";
import { AnalysisTable } from "@/features/analysis/components/AnalysisTable";

export default async function AnalysisPage() {
  let statsData = null;
  let moviesData = null;
  let error = null;

  // Obtener array completo de películas para la tabla
  const moviesResult = await getWatchlistAnalysis();
  moviesData = moviesResult.data;
  error = moviesResult.error;

  // Verificar si hay películas sin calificar
  const unratedMoviesCount = !error && moviesData && moviesData.length > 0
    ? moviesData.filter((item) => item.watchlist.user_rating === null).length
    : 0;

  // Obtener estadísticas pre-calculadas (solo si todas están calificadas)
  try {
    statsData = await getAnalysisData();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar el análisis";
  }

  const isEmpty = !moviesData || moviesData.length === 0;
  const hasUnratedMovies = unratedMoviesCount > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Análisis de cinefilia"
        description="Visualiza y explora las películas importadas desde tu CSV."
      />

      {/* Mensaje informativo si hay películas sin calificar */}
      {hasUnratedMovies && !error && (
        <Section>
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Tienes {unratedMoviesCount} película{unratedMoviesCount > 1 ? "s" : ""} sin calificar
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Para obtener un análisis más completo, te recomendamos calificar todas tus películas.
                  </p>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild className="border-amber-300 dark:border-amber-800 hover:[&_svg]:text-accent hover:[&_svg]:fill-[hsl(var(--accent))]">
                      <Link href={APP_ROUTES.RATE_MOVIES} className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Calificar películas
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {error && (
        <Section>
          <ErrorState
            title="Error al cargar el análisis"
            description={error}
            action={
              <Button asChild>
                <Link href={APP_ROUTES.ANALYSIS}>Reintentar</Link>
              </Button>
            }
          />
        </Section>
      )}

      {!error && isEmpty && (
        <Section>
          <EmptyState
            icon={<Upload className="h-12 w-12" />}
            title="No hay datos para analizar"
            description="Aún no has importado ningún archivo CSV. Sube tu watchlist para comenzar."
            action={
              <Button asChild>
                <Link href={APP_ROUTES.UPLOAD}>Subir CSV</Link>
              </Button>
            }
          />
        </Section>
      )}

      {!error && !isEmpty && moviesData && (
        <>
          {statsData && (
            <Section>
              <AnalysisStats data={statsData} />
            </Section>
          )}

          <Section>
            <AnalysisTable data={moviesData} />
          </Section>
        </>
      )}
    </div>
  );
}

