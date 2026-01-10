import { PageHeader, Section } from "@/components/layout";
import { LibraryGridSkeleton } from "@/features/library";

export default function LibraryLoading() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Mi Biblioteca"
        description="Cargando tu colección..."
      />

      <Section>
        <LibraryGridSkeleton />
      </Section>
    </div>
  );
}
