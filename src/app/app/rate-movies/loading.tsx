import { PageHeader, Section } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { AnalysisStatsSkeleton } from "@/features/analysis/components/AnalysisStatsSkeleton";
import { RateMoviesGridSkeleton } from "@/features/reviews/components/RateMoviesGridSkeleton";

export default function RateMoviesLoading() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Califica tus películas"
        description="Necesitas calificar estas películas antes de ver tu análisis completo. Seleccioná las estrellas para calificar cada película del 1 al 10."
      />

      {/* Botón para ver análisis completo skeleton */}
      <Section>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-[180px] rounded-md" />
        </div>
      </Section>

      {/* Stats skeleton */}
      <Section>
        <AnalysisStatsSkeleton />
      </Section>

      {/* Grid skeleton */}
      <Section>
        <RateMoviesGridSkeleton />
      </Section>
    </div>
  );
}

