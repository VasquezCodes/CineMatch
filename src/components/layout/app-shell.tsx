"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from './app-header';
import { MobileTabs } from './mobile-tabs';
import { BackgroundBlurs } from './background-blurs';
import { ImportStatusIndicator } from '@/features/import';
import { cn } from "@/lib/utils";

export type NavbarVariant = "default" | "cinematic" | "cinematic-mobile-visible";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell
 * Layout base de la aplicación (área app).
 * Composición de header sticky + main + mobile tabs + indicador de importación.
 * Client Component que automáticamente detecta la ruta actual para determinar:
 * - navbarVariant: "cinematic-mobile-visible" para rutas /app/movies/*, "default" para el resto
 * - isLandingPage: true solo para /app (sin padding bottom)
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Determinar la variante del navbar basándose en la ruta
  const navbarVariant: NavbarVariant = pathname?.startsWith("/app/movies")
    ? "cinematic-mobile-visible"
    : "default";

  // Determinar si es la página de landing (sin padding bottom)
  const isLandingPage = pathname === "/app";
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Efectos decorativos de fondo - solo en modo default y no en landing page */}
      {navbarVariant === "default" && !isLandingPage && <BackgroundBlurs />}

      {/* Header fixed */}
      <AppHeader variant={navbarVariant} />

      {/* Contenido principal - Con padding-top para el header fixed */}
      <main className={cn(
        "relative z-10 flex-1 pt-14",
        !isLandingPage && "pb-24 md:pb-8"
      )}>
        {children}
      </main>

      {/* Tabs móviles (solo visible en mobile) */}
      <MobileTabs />

      {/* Indicador de progreso de importación (solo visible cuando hay importaciones en proceso) */}
      <ImportStatusIndicator />
    </div>
  );
}

