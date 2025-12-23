"use client";

import Link from "next/link";
import { useTransition } from "react";
import { APP_ROUTES } from "@/config/routes";
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
import { User, LogOut } from "lucide-react";
import { signout } from "@/features/auth/actions";
import { useAuth } from "@/lib/providers/auth-provider";

/**
 * AppHeader
 * Header sticky con logo, navegación desktop y acciones secundarias.
 */
export function AppHeader() {
  const { user } = useAuth(); // Usamos el hook local para estado reactivo
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signout();
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <Link
          href={APP_ROUTES.HOME}
          className="flex items-center gap-2 font-heading text-xl font-semibold text-foreground transition-all hover:opacity-80"
        >
          CineMatch
        </Link>

        {/* Navegación principal */}
        <AppNav />

        {/* Acciones secundarias */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-9 rounded-full border border-border/50"
                >
                  <User className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 p-1">
                <DropdownMenuItem asChild>
                  <Link
                    href={APP_ROUTES.PROFILE.replace(':username', user.id)} // Usamos ID como username temporalmente
                    className="flex w-full items-center gap-3 px-2 py-2 cursor-pointer transition-opacity hover:opacity-80"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Perfil
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer focus:bg-destructive/5"
                  onSelect={(e: Event) => {
                    e.preventDefault();
                    handleSignOut();
                  }}
                  disabled={isPending}
                >
                  <LogOut className="size-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={APP_ROUTES.LOGIN}>
              <Button variant="default" size="sm">Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
