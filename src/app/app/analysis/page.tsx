import { PageHeader, Section } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
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

  try {
    // Obtener estadísticas pre-calculadas
    statsData = await getAnalysisData();
    
    // Obtener array completo de películas para la tabla
    const moviesResult = await getWatchlistAnalysis();
    moviesData = moviesResult.data;
    error = moviesResult.error;
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar el análisis";
  }

  const isEmpty = !statsData || statsData.totalMovies === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Análisis de cinefilia"
        description="Visualiza y explora las películas importadas desde tu CSV."
      />

      {error && (
        <Section>
          <ErrorState
            title="Error al cargar el análisis"
            message={error}
            action={{
              label: "Reintentar",
              onClick: () => window.location.reload(),
            }}
          />
        </Section>
      )}

      {!error && isEmpty && (
        <Section>
          <EmptyState
            icon={Upload}
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

      {!error && !isEmpty && statsData && moviesData && (
        <>
          <Section>
            <AnalysisStats data={statsData} />
          </Section>

          <Section>
            <AnalysisTable data={moviesData} />
          </Section>
        </>
      )}
    </div>
  );
}

