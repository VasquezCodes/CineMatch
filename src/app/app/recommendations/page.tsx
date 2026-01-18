import Link from "next/link";
import { Sparkles, Film } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, Section, SectionGrid, Container } from "@/components/layout";

interface RecommendationsPageProps {
  searchParams: Promise<{ demo?: string }>;
}

export default async function RecommendationsPage({
  searchParams,
}: RecommendationsPageProps) {
  const params = await searchParams;
  const isDemo = params.demo === "1";

  if (!isDemo) {
    return (
      <Container className="py-6 space-y-8">
        <PageHeader
          title="Recomendaciones"
          description="Explorá sugerencias no lineales según tus cualidades."
        />

        <Section>
          <EmptyState
            icon={<Sparkles className="h-12 w-12" />}
            title="Aún no hay recomendaciones"
            description="Completa tu análisis de gustos para recibir recomendaciones personalizadas basadas en tu historial cinematográfico."
            action={
              <Button asChild>
                <Link href="/app/recommendations?demo=1">
                  Simular recomendaciones
                </Link>
              </Button>
            }
          />
        </Section>
      </Container>
    );
  }

  // Demo: listado de películas placeholder
  const demoMovies = [
    {
      title: "The Substance",
      year: "2024",
      genres: ["Terror", "Ciencia ficción"],
      match: "94%",
    },
    {
      title: "Past Lives",
      year: "2023",
      genres: ["Drama", "Romance"],
      match: "91%",
    },
    {
      title: "Perfect Days",
      year: "2023",
      genres: ["Drama"],
      match: "89%",
    },
    {
      title: "Anatomy of a Fall",
      year: "2023",
      genres: ["Drama", "Thriller"],
      match: "87%",
    },
    {
      title: "The Zone of Interest",
      year: "2023",
      genres: ["Drama", "Historia"],
      match: "85%",
    },
    {
      title: "May December",
      year: "2023",
      genres: ["Drama"],
      match: "83%",
    },
  ];

  return (
    <Container className="py-6 space-y-8">
      <PageHeader
        title="Recomendaciones"
        description="Explorá sugerencias no lineales según tus cualidades."
      />

      <Section
        title="Películas sugeridas"
        description="Basadas en tu perfil cinematográfico y preferencias detectadas"
      >
        <SectionGrid cols={2}>
          {demoMovies.map((movie) => (
            <Card
              key={movie.title}
              className="transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Film
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Badge variant="secondary" className="text-primary">
                    {movie.match}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{movie.title}</CardTitle>
                <CardDescription>{movie.year}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </SectionGrid>
      </Section>

      <Section>
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/app/recommendations">Volver al estado vacío</Link>
          </Button>
        </div>
      </Section>
    </Container>
  );
}
