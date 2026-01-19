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
import { Section, SectionGrid, Container } from "@/components/layout";
import { APP_ROUTES, SECONDARY_ROUTES } from "@/config/routes";
import { LandingHero } from "@/features/landing/components";

export default function AppPage() {
  // Mock: simula si el usuario ya completó la cualificación
  // En producción vendría de auth/db
  const isQualified = true;

  return (
    <>
      {/* Hero Section */}
      <LandingHero />

      {/* Features Section */}
      <Container className="py-16 space-y-12">
        <Section
          title="¿Cómo funciona?"
          description="Cuatro pasos para descubrir tu próxima película favorita"
        >
          <SectionGrid cols={2}>

            {/* 1. Upload Watchlist */}
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
                <CardTitle>Importá tu Lista</CardTitle>
                <CardDescription>
                  Conectá tu watchlist de IMDb o TMDB en segundos y comenzá a descubrir películas personalizadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={APP_ROUTES.UPLOAD}>Importar lista</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 2. Análisis */}
            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary" aria-hidden="true" />
                <CardTitle>Analizá tus Gustos</CardTitle>
                <CardDescription>
                  Nuestro algoritmo identifica patrones en tus películas favoritas para entender tu perfil cinéfilo único.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href={APP_ROUTES.ANALYSIS}>Ver análisis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 3. Perfil cinéfilo */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <ClipboardCheck
                    className="h-8 w-8 text-primary"
                    aria-hidden="true"
                  />
                  {isQualified && (
                    <Badge variant="secondary" className="text-xs">
                      Completado
                    </Badge>
                  )}
                </div>
                <CardTitle>Definí tu Criterio</CardTitle>
                <CardDescription>
                  Señalá las cualidades que más valorás del cine: dirección, actuación, fotografía, guion y más.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant={isQualified ? "outline" : "default"}
                  asChild
                  className="w-full"
                >
                  <Link href={SECONDARY_ROUTES.QUALIFICATION}>Cualificar</Link>
                </Button>
              </CardContent>
            </Card>

            {/* 4. Recomendaciones */}
            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
                <CardTitle>Descubrí Joyas Ocultas</CardTitle>
                <CardDescription>
                  Recibí recomendaciones personalizadas basadas en tu perfil cinematográfico, no en algoritmos genéricos.
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
      </Container>
    </>
  );
}
