'use client';

import * as React from 'react';
import { useAuth } from '@/lib/providers/auth-provider';
import { useTheme } from 'next-themes';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Layout
import { PageHeader } from '@/components/layout';

// Theme
import { ThemeToggle } from '@/components/theme/theme-toggle';

// Icons
import { Palette } from 'lucide-react';

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { resolvedTheme } = useTheme();

  // ========================================
  // Render States
  // ========================================

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (!user) {
    return null;
  }

  // ========================================
  // Main Render
  // ========================================

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuraciones"
        description="Personaliza tu experiencia"
      />

      {/* Apariencia */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Apariencia</CardTitle>
          </div>
          <CardDescription>
            Personaliza el tema de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Tema</p>
              <p className="text-xs text-muted-foreground">
                {resolvedTheme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* TODO: Agregar más configuraciones */}
      {/* - Notificaciones */}
      {/* - Idioma */}
      {/* - Privacidad */}
    </div>
  );
}
