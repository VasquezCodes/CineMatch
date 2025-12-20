'use client';

import Link from 'next/link';
import { APP_ROUTES } from '@/config/routes';
import { AppNav } from './app-nav';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

/**
 * AppHeader
 * Header sticky con logo, navegación desktop y acciones secundarias.
 * Responsive: oculta nav en mobile (< md).
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo / Brand */}
        <Link
          href={APP_ROUTES.HOME}
          className="flex items-center gap-2 font-heading text-xl font-semibold text-foreground transition-colors hover:text-primary"
        >
          CineMatch
        </Link>

        {/* Navegación principal (desktop) */}
        <AppNav />

        {/* Acciones secundarias */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={APP_ROUTES.LOGIN}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Perfil de usuario"
              className="size-9"
            >
              <User className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

