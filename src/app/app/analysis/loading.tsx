import { PageHeader, Section } from "@/components/layout";
import { AnalysisStatsSkeleton } from "@/features/collection/components/AnalysisStatsSkeleton";
import { AnalysisTableSkeleton } from "@/features/collection/components/AnalysisTableSkeleton";

export default function AnalysisLoading() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Análisis de cinefilia"
        description="Visualiza y explora las películas importadas desde tu CSV."
      />

      {/* Stats skeleton */}
      <Section>
        <AnalysisStatsSkeleton />
      </Section>

      {/* Table skeleton */}
      <Section>
        <AnalysisTableSkeleton />
      </Section>
    </div>
  );
}
