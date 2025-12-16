import Link from "next/link";
import { Upload, BarChart3, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, SectionGrid } from "@/components/layout";
import { APP_ROUTES } from "@/config/routes";

export default function AppPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Home"
        description="Tu punto de entrada al flujo CineMatch."
      />

      <Section>
        <SectionGrid cols={3}>
          <Card>
            <CardHeader>
              <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>1. Sube tu lista</CardTitle>
              <CardDescription>
                Importa tu Watchlist desde Letterboxd, IMDb o ingresa títulos
                manualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={APP_ROUTES.UPLOAD}>Comenzar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>2. Analiza tus gustos</CardTitle>
              <CardDescription>
                Descubre patrones en tus preferencias, géneros favoritos y más
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href={APP_ROUTES.ANALYSIS}>Ver análisis</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>3. Recibe recomendaciones</CardTitle>
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
