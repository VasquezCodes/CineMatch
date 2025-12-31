import Link from "next/link";
import { AlertCircle, Star, Upload } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { getAnalysisData } from "@/features/insights/actions";
import { getWatchlistAnalysis } from "@/features/analysis/actions";
import { AnalysisStats } from "@/features/analysis/components/AnalysisStats";
import { AnalysisTable } from "@/features/analysis/components/AnalysisTable";
import { RankingsSection } from "@/features/analysis/components/RankingsSection";
import { PageHeader, Section } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AnalysisPage() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const moviesResult = await getWatchlistAnalysis();
  const moviesData = moviesResult.data ?? [];
  const moviesError = moviesResult.error;

  const unratedMoviesCount = moviesData.filter(
    (item) => item.watchlist.user_rating === null
  ).length;

  let statsData = null;
  let statsError = null;

  try {
    if (moviesData.length > 0) {
      statsData = await getAnalysisData();
    }
  } catch (err) {
    statsError =
      err instanceof Error ? err.message : "Error al cargar estadísticas";
  }

  const globalError = moviesError || statsError;
  const isEmpty = moviesData.length === 0;
  const hasUnratedMovies = unratedMoviesCount > 0;

  if (globalError) {
    return (
      <Section>
        <ErrorState
          title="Error al cargar el análisis"
          description={globalError}
          action={
            <Button asChild>
              <Link href={APP_ROUTES.ANALYSIS}>Reintentar</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  if (isEmpty) {
    return (
      <Section>
        <EmptyState
          icon={<Upload className="h-12 w-12 text-muted-foreground" />}
          title="No hay datos para analizar"
          description="Sube tu archivo CSV para generar un análisis detallado de tu cinefilia."
          action={
            <Button asChild>
              <Link href={APP_ROUTES.UPLOAD}>Subir CSV</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Análisis de cinefilia"
        description="Visualiza y explora las tendencias de tu colección de cine."
      />

      {hasUnratedMovies && (
        <Section>
          <Card className="border-primary/20 bg-primary/5 transition-colors duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-semibold leading-none tracking-tight">
                    Calificaciones pendientes
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tienes {unratedMoviesCount} película
                    {unratedMoviesCount > 1 ? "s" : ""} sin calificar. Completa
                    tu perfil para obtener estadísticas precisas.
                  </p>
                  <div className="pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 border-primary/30 hover:bg-primary hover:text-primary-foreground"
                    >
                      <Link
                        href={APP_ROUTES.RATE_MOVIES}
                        className="flex items-center gap-2"
                      >
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>Calificar ahora</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {statsData && (
        <Section>
          <AnalysisStats data={statsData} />
        </Section>
      )}

      {user && (
        <Section>
          <RankingsSection userId={user.id} />
        </Section>
      )}

      <Section>
        <AnalysisTable data={moviesData} />
      </Section>
    </div>
  );
}
