import Link from "next/link";
import { Upload } from "lucide-react";
import { PageHeader, Section } from "@/components/layout";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { APP_ROUTES, SECONDARY_ROUTES } from "@/config/routes";
import { getLibraryPaginated } from "@/features/library";
import { LibraryGrid } from "@/features/library";

interface LibraryPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort?: string;
    rating?: string;
  }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || undefined;
  const sort = (params.sort as "recent" | "title" | "year" | "rating") || "recent";
  const rating = params.rating ? parseFloat(params.rating) : undefined;

  const result = await getLibraryPaginated(page, {
    searchQuery: search,
    sortBy: sort,
    minRating: rating,
  });

  const { data, error } = result;

  if (error || !data) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Mi Biblioteca"
          description="Tu colección completa de películas"
        />
        <Section>
          <ErrorState
            title="Error al cargar la biblioteca"
            description={error || "No se pudo obtener la información"}
            action={
              <Button asChild>
                <Link href={SECONDARY_ROUTES.LIBRARY}>Reintentar</Link>
              </Button>
            }
          />
        </Section>
      </div>
    );
  }

  if (data.totalCount === 0 && !search && !rating) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Mi Biblioteca"
          description="Tu colección completa de películas"
        />
        <Section>
          <EmptyState
            icon={<Upload className="h-12 w-12 text-muted-foreground" />}
            title="Tu biblioteca está vacía"
            description="Importa tu lista de películas desde IMDb o TMDB para comenzar."
            action={
              <Button asChild>
                <Link href={APP_ROUTES.UPLOAD}>Subir CSV</Link>
              </Button>
            }
          />
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mi Biblioteca"
        description={`Tu colección completa de ${data.totalCount} ${data.totalCount === 1 ? "película" : "películas"}`}
      />

      <Section>
        <LibraryGrid initialData={data} totalMovies={data.totalCount} />
      </Section>
    </div>
  );
}
