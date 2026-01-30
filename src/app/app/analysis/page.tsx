import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, Star, Upload, Trash } from "lucide-react";
import { APP_ROUTES } from "@/config/routes";

import { RankingsSectionClient } from "@/features/collection/components/RankingsSectionClient";
import { RankingsSkeleton } from "@/features/collection/components/RankingsSkeleton";
import { CollaborationsSection } from "@/features/analysis/components/CollaborationsSection";
import { AnalysisClientWrapper } from "./AnalysisClientWrapper";
import { PageHeader, Section, Container } from "@/components/layout";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================
// Componentes Server con Suspense
// Cada uno hace su propia carga de datos
// ============================================



/**
 * Componente que muestra la alerta de películas sin calificar
 */
async function UnratedMoviesAlert() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Contar películas sin calificar
  const { data: unratedMovies } = await supabase
    .from("watchlists")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .is("user_rating", null);

  const unratedMoviesCount = unratedMovies?.length ?? 0;

  if (unratedMoviesCount === 0) return null;

  return (
    <Card className="border-primary/30 bg-primary/10 backdrop-blur-xl transition-colors duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h4 className="text-sm font-semibold leading-none tracking-tight">
              Calificaciones pendientes
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tienes {unratedMoviesCount} película
              {unratedMoviesCount > 1 ? "s" : ""} sin calificar. Completa tu
              perfil para obtener estadísticas precisas.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
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
              <Button
                variant="destructive"
                size="sm"
                className="h-8 flex items-center gap-2"
              >
                <Trash className="h-3.5 w-3.5" />
                <span>Eliminar CSV</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Verifica si el usuario tiene películas en su colección
 */
async function checkHasMovies(): Promise<boolean> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { count } = await supabase
    .from("watchlists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (count ?? 0) > 0;
}

// ============================================
// Página principal con Suspense boundaries
// ============================================

export default async function AnalysisPage() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect or handle unauthenticated state (though middleware usually handles this)
  if (!user) return null;

  // Solo verificamos si hay películas para mostrar el estado vacío
  // El resto de datos se carga en paralelo con Suspense
  const hasMovies = await checkHasMovies();

  if (!hasMovies) {
    return (
      <Container className="py-6">
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
      </Container>
    );
  }

  return (
    <Container className="py-6 space-y-10">
      {/* 
        Header se renderiza inmediatamente gracias a Suspense
        Las animaciones de reveal se mantienen para mejor UX
      */}
      <PageHeader
        title="Análisis de cinefilia"
        description="Visualiza y explora las tendencias de tu colección de cine."
      />

      {/* Alerta de películas sin calificar - carga independiente */}
      <Suspense fallback={null}>
        <Section>
          <UnratedMoviesAlert />
        </Section>
      </Suspense>


      {/* 
        Rankings + Colaboraciones
        Integrados en un Client Wrapper para compartir estado de filtrado
      */}
      <Suspense
        fallback={
          <div className="space-y-10">
            <Section>
              <RankingsSkeleton />
            </Section>
            <Section>
              <Skeleton className="h-64 w-full rounded-xl" />
            </Section>
          </div>
        }
      >
        <AnalysisClientWrapper userId={user.id} />
      </Suspense>
    </Container>
  );
}
