"use client";

import Link from "next/link";
import { useTransition } from "react";
import { User, LogOut } from "lucide-react";

import { APP_ROUTES } from "@/config/routes";
import { signout } from "@/features/auth/actions";
import { useAuth } from "@/lib/providers/auth-provider";

import { AppNav } from "./app-nav";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * AppHeader
 * Header con arquitectura de tres columnas:
 * Izquierda (Logo), Centro (Nav), Derecha (Acciones).
 */
export function AppHeader() {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signout();
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Usamos un contenedor con padding horizontal (px-6) para los márgenes laterales.
          'max-w-screen-2xl' opcional para evitar que en monitores ultra-wide se separe demasiado.
      */}
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center px-6">
        {/* SECCIÓN IZQUIERDA: Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link
            href={APP_ROUTES.HOME}
            className="font-heading text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            CineMatch
          </Link>
        </div>

        {/* SECCIÓN CENTRAL: Navegación (Solo Desktop) */}
        <div className="hidden md:flex items-center justify-center">
          <AppNav />
        </div>

        {/* SECCIÓN DERECHA: Acciones y Perfil */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 rounded-full border border-border/40 bg-background shadow-sm hover:bg-accent"
                >
                  <User className="size-4" />
                  <span className="sr-only">Menú de usuario</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 p-2"
                sideOffset={8}
              >
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.PROFILE.replace(":username", user.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent"
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="size-5" />
                    </div>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium leading-none">Perfil</p>
                      <p className="text-xs text-muted-foreground truncate w-[140px]">
                        {user.email}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                  disabled={isPending}
                >
                  <LogOut className="mr-2 size-4" />
                  <span>{isPending ? "Cerrando..." : "Cerrar Sesión"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={APP_ROUTES.LOGIN}>
              <Button size="sm" className="h-8 px-4">
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
