import { PageHeader, Section } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/config/routes";
import { getWatchlistAnalysis } from "@/features/analysis/actions";
import { AnalysisStats } from "@/features/analysis/components/AnalysisStats";
import { AnalysisTable } from "@/features/analysis/components/AnalysisTable";

export default async function AnalysisPage() {
  const { data, error } = await getWatchlistAnalysis();

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

      {!error && (!data || data.length === 0) && (
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

      {!error && data && data.length > 0 && (
        <>
          <Section>
            <AnalysisStats data={data} />
          </Section>

          <Section>
            <AnalysisTable data={data} />
          </Section>
        </>
      )}
    </div>
  );
}

