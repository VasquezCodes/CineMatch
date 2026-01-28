'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/auth-provider';

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Layout
import { PageHeader } from '@/components/layout';

// Icons
import { Library, ArrowRight } from 'lucide-react';

function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LibraryPage() {
  const { user, isLoading } = useAuth();

  // ========================================
  // Render States
  // ========================================

  if (isLoading) {
    return <LibrarySkeleton />;
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
        title="Mis Películas"
        description="Gestiona tu biblioteca personal"
      />

      <Card className="bg-card/80 backdrop-blur-xl border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Library className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Biblioteca Personal</CardTitle>
          </div>
          <CardDescription>
            Accede a todas tus películas calificadas y guardadas
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <Library className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Tu Biblioteca</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Esta sección te permite gestionar tus películas calificadas, guardadas y favoritas.
              </p>
            </div>
            <div className="pt-2">
              <Button asChild>
                <Link href="/app/library" className="gap-2">
                  Ir a mi biblioteca
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Integrar estadísticas de biblioteca */}
      {/* - Total de películas calificadas */}
      {/* - Películas favoritas */}
      {/* - Géneros más vistos */}
      {/* - Tiempo total visto */}
    </div>
  );
}
