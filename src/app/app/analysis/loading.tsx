import { PageHeader, Section, Container } from "@/components/layout";
import { AnalysisStatsSkeleton } from "@/features/collection/components/AnalysisStatsSkeleton";
import { AnalysisTableSkeleton } from "@/features/collection/components/AnalysisTableSkeleton";

export default function AnalysisLoading() {
  return (
    <Container className="py-6 space-y-10">
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
    </Container>
  );
}
