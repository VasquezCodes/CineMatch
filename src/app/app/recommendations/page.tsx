import { Suspense } from "react";
import { Container } from "@/components/layout";
import { getConstellationData, getRecommendations } from "@/features/recommendations/actions";
import { ConstellationMap, RecommendationsGrid } from "@/features/recommendations/components";
import { Sparkles, Network, Grid3X3, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recomendaciones | CineMatch",
  description: "Descubre películas basadas en tus gustos.",
};

// Loading skeleton for constellation
function ConstellationSkeleton() {
  return (
    <div className="space-y-8 py-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-32 h-44 rounded-xl" />
          <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
          <div className="flex gap-3">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="w-24 h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Async component for constellation data fetching
async function ConstellationSection() {
  const { data, error } = await getConstellationData();

  if (error || !data || data.nodes.length === 0) {
    return (
      <div className="w-full py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50 mb-4">
          <Network className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Tu mapa está en construcción</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Califica más películas con 4 o 5 estrellas para ver las conexiones con recomendaciones.
        </p>
      </div>
    );
  }

  return <ConstellationMap data={data} />;
}

// Async component for grid section
async function GridSection() {
  const { data: recommendations } = await getRecommendations();
  return <RecommendationsGrid items={recommendations || []} />;
}

export default function RecommendationsPage() {
  return (
    <div className="relative w-full min-h-screen bg-background">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-chart-5/3 rounded-full blur-[100px] translate-y-1/2" />
      </div>

      {/* Hero Section */}
      <Container className="relative z-10 pt-12 pb-6">
        <div className="max-w-2xl mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Recomendaciones
          </h1>
          <p className="text-muted-foreground">
            Basadas en tus películas favoritas, haz clic en cualquier póster para explorar.
          </p>
        </div>

        {/* Constellation Map */}
        <Suspense fallback={<ConstellationSkeleton />}>
          <ConstellationSection />
        </Suspense>
      </Container>

      {/* Grid Section */}
      <Container className="py-16 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
            <Grid3X3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Todas las Recomendaciones</h2>
            <p className="text-sm text-muted-foreground">Vista en cuadrícula para explorar más películas</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        }>
          <GridSection />
        </Suspense>
      </Container>
    </div>
  );
}
