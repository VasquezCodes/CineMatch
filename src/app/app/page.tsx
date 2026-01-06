import Link from "next/link";
import { Upload, BarChart3, Sparkles, ClipboardCheck } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Section, SectionGrid } from "@/components/layout";
import { APP_ROUTES, SECONDARY_ROUTES } from "@/config/routes";

export default function AppPage() {
  // Mock: simula si el usuario ya completó la cualificación
  // En producción vendría de auth/db
  const isQualified = true;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tu espacio"
        description="Gestioná tu perfil y descubrí nuevas películas que se alinean con tu criterio cinéfilo."
      />

      <Section>
        <SectionGrid cols={2}>
          {/* Upload Watchlist */}
          <Card>
            <CardHeader>
              <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>Subir Watchlist</CardTitle>
              <CardDescription>
                Importá tu lista desde IMDb o TMDB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={APP_ROUTES.UPLOAD}>Importar lista</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Análisis */}
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>Análisis</CardTitle>
              <CardDescription>
                Elabora rankings con tus gustos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href={APP_ROUTES.ANALYSIS}>Ver análisis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Perfil cinéfilo */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <ClipboardCheck className="h-8 w-8 text-primary" aria-hidden="true" />
                {isQualified && (
                  <Badge variant="secondary" className="text-xs">
                    Completado
                  </Badge>
                )}
              </div>
              <CardTitle>Perfil cinéfilo</CardTitle>
              <CardDescription>
                {isQualified
                  ? "Tu perfil de cualificación está listo. Podés editarlo cuando quieras."
                  : "Definí qué aspectos del cine valoras para recibir mejores recomendaciones."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant={isQualified ? "outline" : "default"}
                asChild
                className="w-full"
              >
                <Link href={SECONDARY_ROUTES.QUALIFICATION}>
                  Cualificar
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          <Card>
            <CardHeader>
              <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>Recomendaciones</CardTitle>
              <CardDescription>
                Películas personalizadas basadas en tu perfil cinematográfico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href={APP_ROUTES.RECOMMENDATIONS}>Explorar</Link>
              </Button>
            </CardContent>
          </Card>
        </SectionGrid>
      </Section>
    </div>
  );
}
