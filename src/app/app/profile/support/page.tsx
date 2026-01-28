'use client';

import * as React from 'react';
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
import { HelpCircle, Mail, FileText, MessageCircle } from 'lucide-react';

function SupportSkeleton() {
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

export default function SupportPage() {
  const { user, isLoading } = useAuth();

  // ========================================
  // Render States
  // ========================================

  if (isLoading) {
    return <SupportSkeleton />;
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
        title="Ayuda y Soporte"
        description="Estamos aquí para ayudarte"
      />

      <Card className="bg-card/80 backdrop-blur-xl border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Centro de Ayuda</CardTitle>
          </div>
          <CardDescription>
            Encuentra respuestas o contacta con nuestro equipo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              disabled
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">Documentación</p>
                <p className="text-xs text-muted-foreground">
                  Guías y tutoriales
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              disabled
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">FAQ</p>
                <p className="text-xs text-muted-foreground">
                  Preguntas frecuentes
                </p>
              </div>
            </Button>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              disabled
            >
              <Mail className="h-4 w-4" />
              Contactar soporte
            </Button>
          </div>

          <div className="pt-4 text-center text-sm text-muted-foreground">
            <p>¿Necesitas ayuda inmediata?</p>
            <p className="text-xs">
              Envía un email a{' '}
              <a
                href="mailto:support@cinematch.com"
                className="text-primary hover:underline"
              >
                support@cinematch.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Agregar secciones de ayuda */}
      {/* - FAQ interactivo */}
      {/* - Guías paso a paso */}
      {/* - Video tutoriales */}
      {/* - Chat en vivo */}
    </div>
  );
}
