"use client";

import * as React from "react";
import {
  Film,
  Heart,
  Star,
  Trash2,
  Plus,
  Check,
  X,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";

// Componentes shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

/**
 * UIPreview - Demo interno de todos los componentes UI base
 *
 * NO usar en producción. Solo para verificación visual durante desarrollo.
 * Este componente NO se debe enrutar ni mostrar a usuarios finales.
 */
export function UIPreview() {
  const [checked, setChecked] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState("");
  const [isDark, setIsDark] = React.useState(false);

  // Aplicar/remover clase dark en el HTML
  React.useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-heading">
              CineMatch UI Components
            </h1>
            <Badge variant="outline" className="text-xs">
              {isDark ? "Dark" : "Light"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Biblioteca base de componentes · Solo preview interno
          </p>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="shrink-0"
          title={
            isDark
              ? "Modo Oscuro activo - Click para Light"
              : "Modo Claro activo - Click para Dark"
          }
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Like</span>
          </Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Inputs</h2>
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
          <div className="space-y-2">
            <label htmlFor="input-1" className="text-sm font-medium">
              Email
            </label>
            <Input id="input-1" type="email" placeholder="tu@ejemplo.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="input-2" className="text-sm font-medium">
              Disabled
            </label>
            <Input id="input-2" placeholder="Input deshabilitado" disabled />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="textarea-1" className="text-sm font-medium">
              Comentario
            </label>
            <Textarea
              id="textarea-1"
              placeholder="Escribe tu opinión sobre la película..."
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* Checkbox & Select */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Checkbox & Select
        </h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                className="peer"
                id="check-1"
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
              />
              <label
                htmlFor="check-1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los términos
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox className="peer" id="check-2" disabled />
              <label
                htmlFor="check-2"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Checkbox deshabilitado
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="select-1" className="text-sm font-medium">
              Género favorito
            </label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger id="select-1">
                <SelectValue placeholder="Selecciona un género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="action">Acción</SelectItem>
                <SelectItem value="comedy">Comedia</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="sci-fi">Ciencia Ficción</SelectItem>
                <SelectItem value="horror">Terror</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card Simple</CardTitle>
              <CardDescription>Descripción básica de la card</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contenido de ejemplo para mostrar una card básica con estilos
                consistentes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Con Footer</CardTitle>
              <CardDescription>Card con acciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Esta card incluye un footer con botones de acción.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
              <Button size="sm">Confirmar</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Con Ícono</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Film className="h-4 w-4" />
                  <span>Vista de película</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <span className="text-sm">4.5/5.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dialogs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Dialogs</h2>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Título del Dialog</DialogTitle>
                <DialogDescription>
                  Este es un modal estándar para formularios o contenido
                  complejo. Presiona ESC o haz clic fuera para cerrar.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input placeholder="Campo de ejemplo" />
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Eliminar elemento</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  el elemento seleccionado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction>Continuar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Tabs</h2>
        <Tabs defaultValue="overview" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="cast">Reparto</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              Contenido del tab "Resumen". Aquí irían detalles generales de la
              película.
            </p>
          </TabsContent>
          <TabsContent value="cast" className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              Contenido del tab "Reparto". Listado de actores y directores.
            </p>
          </TabsContent>
          <TabsContent value="reviews" className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              Contenido del tab "Reseñas". Opiniones de usuarios.
            </p>
          </TabsContent>
        </Tabs>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">
            <Star className="h-3 w-3 mr-1" />
            Con ícono
          </Badge>
        </div>
      </section>

      {/* Avatar */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Avatar</h2>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="Usuario" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="invalid-url" alt="Fallback" />
            <AvatarFallback>FB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>
              <Film className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </section>

      {/* Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Skeleton</h2>
        <div className="space-y-3 max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </section>

      {/* Toast */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Toast (Sonner)
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => toast.success("Operación exitosa")}
          >
            <Check className="h-4 w-4 mr-2" />
            Success Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Ha ocurrido un error")}
          >
            <X className="h-4 w-4 mr-2" />
            Error Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("Información importante")}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Info Toast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast("Película agregada", {
                description: "Se agregó 'Inception' a tu lista",
                action: {
                  label: "Ver",
                  onClick: () => console.log("Ver"),
                },
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Toast con acción
          </Button>
        </div>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Empty State</h2>
        <div className="space-y-6">
          <EmptyState
            icon={<Film className="h-12 w-12" />}
            title="No hay películas"
            description="Tu biblioteca está vacía. Explora películas y agrégalas para comenzar a construir tu colección personalizada."
            action={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Explorar películas
              </Button>
            }
          />

          <EmptyState
            icon={<Heart className="h-12 w-12" />}
            title="Sin favoritos"
            description="Aún no has marcado ninguna película como favorita."
          />

          <EmptyState
            title="Sin descripción ni ícono"
            action={<Button variant="outline">Acción simple</Button>}
          />
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Paleta de Colores Oficial
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded-md bg-background border-2 border-border flex items-center justify-center">
                <span className="text-xs font-mono text-foreground">
                  {isDark ? "#0B1120" : "#FFFFFF"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Surface/Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded-md bg-card border-2 border-border flex items-center justify-center">
                <span className="text-xs font-mono text-card-foreground">
                  {isDark ? "#1E293B" : "#F8FAFC"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Border</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded-md bg-background border-4 border-border flex items-center justify-center">
                <span className="text-xs font-mono text-foreground">
                  {isDark ? "#334155" : "#E2E8F0"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Text Main</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded-md bg-card border-2 border-border flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">Aa</span>
                <span className="ml-2 text-xs font-mono text-muted-foreground">
                  {isDark ? "#F1F5F9" : "#0F172A"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Text Muted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded-md bg-card border-2 border-border flex items-center justify-center">
                <span className="text-xl text-muted-foreground">Aa</span>
                <span className="ml-2 text-xs font-mono text-muted-foreground">
                  {isDark ? "#94A3B8" : "#64748B"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accent (Primary)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded-md bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-xs font-mono text-primary-foreground font-semibold">
                  {isDark ? "#22C55E" : "#16A34A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <div className="pt-8 border-t text-center text-sm text-muted-foreground">
        <p>
          Este preview es solo para desarrollo interno. No usar en producción.
        </p>
      </div>
    </div>
  );
}
