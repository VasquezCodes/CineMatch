import { PageHeader, Section } from "@/components/layout";
import { UploadWatchlistForm } from "@/features/watchlist";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Subida de Watchlist"
        description="Importá tu lista para enriquecer datos y empezar el análisis."
      />

      <Section>
        <UploadWatchlistForm
          accept=".svg"
          maxSizeMB={10}
        />
      </Section>
    </div>
  );
}

