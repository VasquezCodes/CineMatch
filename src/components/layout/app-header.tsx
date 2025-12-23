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
import { useAuth } from '@/lib/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * AppHeader
 * Header sticky con logo, navegación desktop y acciones secundarias.
 * Responsive: oculta nav en mobile (< md).
 */
export function AppHeader() {
  const { user } = useAuth();

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

          {user ? (
            <Link href={APP_ROUTES.PROFILE.replace(':username', user.id)}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                  <AvatarFallback>{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </Link>
          ) : (
            <Link href={APP_ROUTES.LOGIN}>
              <Button variant="default" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

