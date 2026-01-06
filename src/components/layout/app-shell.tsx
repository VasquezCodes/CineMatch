import { AppHeader } from './app-header';
import { MobileTabs } from './mobile-tabs';
import { ImportStatusIndicator } from '@/features/import';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell
 * Layout base de la aplicación (área app).
 * Composición de header sticky + main + mobile tabs + indicador de importación.
 * Server Component por defecto.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header sticky */}
      <AppHeader />

      {/* Contenido principal */}
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* Tabs móviles (solo visible en mobile) */}
      <MobileTabs />

      {/* Indicador de progreso de importación (solo visible cuando hay importaciones en proceso) */}
      <ImportStatusIndicator />
    </div>
  );
}

