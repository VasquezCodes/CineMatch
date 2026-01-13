import { AppHeader } from './app-header';
import { MobileTabs } from './mobile-tabs';
import { Container } from './container';
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
        <Container className="py-6 pb-24 md:py-8 md:pb-8">
          {children}
        </Container>
      </main>

      {/* Tabs móviles (solo visible en mobile) */}
      <MobileTabs />

      {/* Indicador de progreso de importación (solo visible cuando hay importaciones en proceso) */}
      <ImportStatusIndicator />
    </div>
  );
}

