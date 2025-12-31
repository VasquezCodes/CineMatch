import { PageHeader } from "@/components/layout";
import { FastRankingSkeleton } from "@/features/reviews";

export default function RateMoviesLoading() {
  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Modo Rápido de Calificación"
        description="Califica tu colección con un solo clic para generar tu perfil cinéfilo."
      />

      <FastRankingSkeleton />
    </div>
  );
}

