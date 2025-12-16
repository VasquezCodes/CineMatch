import Link from "next/link";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/layout";
import { APP_ROUTES } from "@/config/routes";

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Análisis de cinefilia"
        description="Procesamos patrones de tu historial para construir tu perfil."
      />

      <Section>
        <LoadingState label="Analizando tus preferencias, géneros favoritos y patrones de consumo..." />
      </Section>

      <Section>
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href={APP_ROUTES.RECOMMENDATIONS}>
              Ver resultado simulado
            </Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}

