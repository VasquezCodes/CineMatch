import { Container, PageHeader } from "@/components/layout";
import { getRecommendations } from "@/features/recommendations/actions";
import { RecommendationsGrid } from "@/features/recommendations/components";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recomendaciones Para Ti",
  description: "Descubre tu próxima película favorita basada en tus gustos únicos.",
};

export default async function RecommendationsPage() {
  const { data: recommendations } = await getRecommendations();

  return (
    <Container className="py-8">
      <PageHeader
        title="Recomendaciones"
        description="Seleccionadas por nuestro algoritmo híbrido basado en tus cualificaciones y gustos."
      />

      <div className="mt-8">
        <RecommendationsGrid items={recommendations || []} />
      </div>
    </Container>
  );
}
