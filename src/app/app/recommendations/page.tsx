import { Container } from "@/components/layout";
import { WavyBackground } from "@/components/ui/wavy-background";
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
    <div className="relative w-full min-h-screen">
      {/* Hero Section with Wavy Background */}
      <WavyBackground className="max-w-4xl mx-auto pb-10 pt-20">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 font-sans tracking-tight">
            Recomendaciones <span className="text-primary block md:inline">Para Ti</span>
          </h1>
          <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
            Una selección curada por nuestro algoritmo híbrido, diseñada específicamente para
            coincidir con tus gustos cinematográficos únicos.
          </p>
        </div>
      </WavyBackground>

      {/* Main Content */}
      <Container className="py-12 -mt-20 relative z-10">
        <RecommendationsGrid items={recommendations || []} />
      </Container>
    </div>
  );
}
