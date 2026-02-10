import { Suspense } from "react";
import { Container } from "@/components/layout";
import { getConstellationData, getRecommendations } from "@/features/recommendations/actions";
import { ConstellationMap, RecommendationsGrid } from "@/features/recommendations/components";
import { Sparkles, Network, Grid3X3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recomendaciones | CineMatch",
  description: "Descubre películas basadas en tus gustos.",
};

// Loading skeleton for constellation - neural network style
function ConstellationSkeleton() {
  return (
    <div className="relative h-[400px] flex items-center justify-center">
      {/* Animated loading circles */}
      <div className="flex items-center gap-32">
        {/* Source nodes skeleton */}
        <div className="flex flex-col gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="absolute inset-0 rounded-full animate-pulse bg-primary/10" style={{ animationDelay: `${i * 0.2}s` }} />
            </div>
          ))}
        </div>
        {/* Center pulse */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-px bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-pulse" />
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <div className="w-32 h-px bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-pulse" />
        </div>
        {/* Recommendation nodes skeleton */}
        <div className="flex flex-col gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="relative">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="absolute inset-0 rounded-full animate-pulse bg-chart-5/10" style={{ animationDelay: `${i * 0.15}s` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Async component for constellation data fetching
async function ConstellationSection() {
  const { data, error } = await getConstellationData();

  if (error || !data || data.nodes.length === 0) {
    return (
      <div className="w-full py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
          <Network className="w-10 h-10 text-primary/60" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Tu universo está en construcción</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Califica películas con 4 o 5 estrellas para construir tu constelación personal de recomendaciones.
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
      {/* Cosmic gradient background - Stitch Design */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Purple cosmic glow - top left */}
        <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-violet-500/10 dark:bg-violet-900/20 rounded-full blur-[150px]" />
        {/* Blue cosmic glow - top right */}
        <div className="absolute -top-1/4 right-0 w-[600px] h-[600px] bg-blue-500/8 dark:bg-blue-900/15 rounded-full blur-[120px]" />
        {/* Primary glow - bottom */}
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px] translate-y-1/2" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Hero Section - Tu Universo de Películas */}
      <section className="relative z-10 pt-16 pb-8">
        <Container>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Personalizado para ti</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Tu Universo de Películas
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora las conexiones entre tus películas favoritas y descubre nuevas recomendaciones basadas en tu gusto único.
            </p>
          </div>

          {/* Constellation Map */}
          <div className="relative">
            {/* Decorative frame */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-foreground/[0.03] to-transparent pointer-events-none" />
            <div className="absolute -inset-4 rounded-3xl border border-border/50 pointer-events-none" />

            <Suspense fallback={<ConstellationSkeleton />}>
              <ConstellationSection />
            </Suspense>
          </div>
        </Container>
      </section>

      {/* Divider */}
      <div className="relative z-10 py-8">
        <Container>
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </Container>
      </div>

      {/* Grid Section */}
      <section className="relative z-10 pb-20">
        <Container>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-xl bg-gradient-to-br from-muted to-muted/50 border border-border">
              <Grid3X3 className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Explorar Más</h2>
              <p className="text-muted-foreground">Todas las recomendaciones en vista de cuadrícula</p>
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
      </section>
    </div>
  );
}
