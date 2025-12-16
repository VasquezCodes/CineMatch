import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section, SectionGrid } from "@/components/layout";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Perfil"
        description="Preferencias y ajustes de tu experiencia."
      />

      <Section title="Información básica">
        <SectionGrid cols={2}>
          {/* Info de Usuario */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Información de Usuario</CardTitle>
              </div>
              <CardDescription>Datos básicos de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nombre
                </p>
                <p className="text-foreground">Usuario Demo</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Películas vistas
                </p>
                <p className="text-foreground">142 títulos</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Miembro desde
                </p>
                <p className="text-foreground">Diciembre 2024</p>
              </div>
            </CardContent>
          </Card>

          {/* Preferencias */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Preferencias</CardTitle>
              </div>
              <CardDescription>Tus géneros y estilos favoritos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Géneros favoritos
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Drama</Badge>
                  <Badge variant="secondary">Ciencia ficción</Badge>
                  <Badge variant="secondary">Thriller</Badge>
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Directores favoritos
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Denis Villeneuve</Badge>
                  <Badge variant="outline">Greta Gerwig</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </SectionGrid>
      </Section>

      <Section title="Configuración">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Personalización</CardTitle>
            </div>
            <CardDescription>
              Personaliza tu experiencia en CineMatch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" className="flex-1">
                Editar preferencias
              </Button>
              <Button variant="outline" className="flex-1">
                Gestionar listas
              </Button>
              <Button variant="outline" className="flex-1">
                Configuración de privacidad
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
