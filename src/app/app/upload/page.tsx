"use client";

import { PageHeader, Section } from "@/components/layout";
import { UploadWatchlistForm } from "@/features/watchlist";

export default function UploadPage() {
  const handleUpload = async (file: File) => {
    // TODO: Implementar la lógica de subida del archivo CSV
    // Por ahora, simulamos un delay para que se vea el progreso
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Aquí iría la lógica real de upload:
    // const formData = new FormData();
    // formData.append('file', file);
    // await fetch('/api/upload', { method: 'POST', body: formData });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subida de Watchlist"
        description="Importá tu lista para enriquecer datos y empezar el análisis."
      />

      <Section>
        <UploadWatchlistForm
          onUpload={handleUpload}
          maxSizeMB={10}
        />
      </Section>
    </div>
  );
}

