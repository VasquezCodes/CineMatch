import Link from "next/link";
import { Upload } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/layout";
import { APP_ROUTES } from "@/config/routes";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Subida de Watchlist"
        description="Importá tu lista para enriquecer datos y empezar el análisis."
      />

      <Section>
        <EmptyState
          icon={<Upload className="h-12 w-12" />}
          title="No hay Watchlist cargada"
          description="Sube tu lista de películas y series de Letterboxd, IMDb o ingresa títulos manualmente para comenzar."
          action={
            <Button asChild>
              <Link href={APP_ROUTES.ANALYSIS}>Simular carga</Link>
            </Button>
          }
        />
      </Section>
    </div>
  );
}

