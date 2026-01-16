import Link from "next/link";
import { Upload } from "lucide-react";
import { PageHeader, Section } from "@/components/layout";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/config/routes";
import { getImports } from "@/features/import/actions";
import { ImportHistoryList } from "@/features/import/components/ImportHistoryList";

export default async function ImportsPage() {
    const imports = await getImports();

    if (imports.length === 0) {
        return (
            <div className="space-y-8">
                <PageHeader
                    title="Historial de Importaciones"
                    description="Revisa tus importaciones anteriores"
                />
                <Section>
                    <EmptyState
                        icon={<Upload className="h-12 w-12 text-muted-foreground" />}
                        title="Sin importaciones"
                        description="Aún no has importado ninguna lista de películas."
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
                title="Historial de Importaciones"
                description={`${imports.length} ${imports.length === 1 ? "importación" : "importaciones"} realizadas`}
            />

            <Section>
                <ImportHistoryList imports={imports} />
            </Section>
        </div>
    );
}
