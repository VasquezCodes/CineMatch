import { PageHeader, Section, Container } from "@/components/layout";
import { LibraryGridSkeleton } from "@/features/library";

export default function LibraryLoading() {
  return (
    <Container className="py-6 space-y-8">
      <PageHeader
        title="Mi Biblioteca"
        description="Cargando tu colección..."
      />

      <Section>
        <LibraryGridSkeleton />
      </Section>
    </Container>
  );
}
