import Link from "next/link";
import { AlertCircle, Star, Upload, Library } from "lucide-react";
import { APP_ROUTES, SECONDARY_ROUTES } from "@/config/routes";
import { getAnalysisData } from "@/features/insights/actions";
import { AnalysisStats } from "@/features/analysis/components/AnalysisStats";
import { RankingsSection } from "@/features/analysis/components/RankingsSection";
import { PageHeader, Section } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getTopRatedMovies } from "@/features/library";
import { MovieCard } from "@/features/library";

export default async function AnalysisPage() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obtener películas destacadas (top 6)
  const topMoviesResult = await getTopRatedMovies(6);
  const topMovies = topMoviesResult.data ?? [];
  const moviesError = topMoviesResult.error;

  // Contar películas sin calificar
  const { data: allMovies } = await supabase
    .from("watchlists")
    .select("rating", { count: "exact" })
    .eq("user_id", user?.id || "")
    .is("rating", null);

  const unratedMoviesCount = allMovies?.length ?? 0;
  const totalMoviesCount = topMovies.length;

  let statsData = null;
  let statsError = null;

  try {
    if (totalMoviesCount > 0) {
      statsData = await getAnalysisData();
    }
  } catch (err) {
    statsError =
      err instanceof Error ? err.message : "Error al cargar estadísticas";
  }

  const globalError = moviesError || statsError;
  const isEmpty = totalMoviesCount === 0;
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

      {/* Películas destacadas */}
      {topMovies.length > 0 && (
        <Section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Películas destacadas</CardTitle>
                  <CardDescription>
                    Tus {topMovies.length} películas mejor calificadas
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={SECONDARY_ROUTES.LIBRARY}>
                    <Library className="h-4 w-4" />
                    Ver toda mi biblioteca
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topMovies.map((item) => (
                  <MovieCard key={item.watchlist.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </Section>
      )}
    </div>
  );
}
