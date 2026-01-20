import { AppHeader } from './app-header';
import { MobileTabs } from './mobile-tabs';
import { BackgroundBlurs } from './background-blurs';
import { ImportStatusIndicator } from '@/features/import';

export type NavbarVariant = "default" | "cinematic" | "cinematic-mobile-visible";

interface AppShellProps {
  children: React.ReactNode;
  navbarVariant?: NavbarVariant;
  isLandingPage?: boolean;
}

/**
 * AppShell
 * Layout base de la aplicación (área app).
 * Composición de header sticky + main + mobile tabs + indicador de importación.
 * Server Component por defecto.
 *
 * @param navbarVariant - "default" para navbar estándar, "cinematic" para navbar transparente sobre backdrops, "cinematic-mobile-visible" para navbar visible en mobile y transparente en desktop
 * @param isLandingPage - true si es la página de landing (sin padding bottom)
 */
export function AppShell({ children, navbarVariant = "default", isLandingPage = false }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Efectos decorativos de fondo - solo en modo default */}
      {navbarVariant === "default" && <BackgroundBlurs />}

      {/* Header sticky */}
      <AppHeader variant={navbarVariant} />

      {/* Contenido principal - Sin restricciones de ancho ni padding */}
      <main className={isLandingPage ? "flex-1" : "flex-1 pb-24 md:pb-8"}>
        {children}
      </main>

      {/* Tabs móviles (solo visible en mobile) */}
      <MobileTabs />

      {/* Indicador de progreso de importación (solo visible cuando hay importaciones en proceso) */}
      <ImportStatusIndicator />
    </div>
  );
}

