import { AppHeader } from './app-header';
import { MobileTabs } from './mobile-tabs';
import { BackgroundBlurs } from './background-blurs';
import { ImportStatusIndicator } from '@/features/import';

export type NavbarVariant = "default" | "cinematic";

interface AppShellProps {
  children: React.ReactNode;
  navbarVariant?: NavbarVariant;
}

/**
 * AppShell
 * Layout base de la aplicación (área app).
 * Composición de header sticky + main + mobile tabs + indicador de importación.
 * Server Component por defecto.
 * 
 * @param navbarVariant - "default" para navbar estándar, "cinematic" para navbar transparente sobre backdrops
 */
export function AppShell({ children, navbarVariant = "default" }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Efectos decorativos de fondo - solo en modo default */}
      {navbarVariant === "default" && <BackgroundBlurs />}

      {/* Header sticky */}
      <AppHeader variant={navbarVariant} />

      {/* Contenido principal - Sin restricciones de ancho ni padding */}
      <main className="flex-1 pb-24 md:pb-8">
        {children}
      </main>

      {/* Tabs móviles (solo visible en mobile) */}
      <MobileTabs />

      {/* Indicador de progreso de importación (solo visible cuando hay importaciones en proceso) */}
      <ImportStatusIndicator />
    </div>
  );
}

