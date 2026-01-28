'use client';

import * as React from 'react';
import { useAuth } from '@/lib/providers/auth-provider';
import { toast } from 'sonner';

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
import { Shield, Key } from 'lucide-react';

// Actions
import { resetPassword } from '@/features/auth/actions';

function SecuritySkeleton() {
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

export default function SecurityPage() {
  const { user, isLoading } = useAuth();

  // ========================================
  // Event Handlers
  // ========================================

  const handleResetPassword = async () => {
    if (!user?.email) return;

    try {
      const formData = new FormData();
      formData.set('email', user.email);
      const result = await resetPassword(formData);

      if (result?.error) {
        toast.error('Error', { description: result.error });
      } else {
        toast.success('Email enviado', {
          description: 'Revisa tu correo para restablecer tu contraseña',
        });
      }
    } catch (error) {
      toast.error('Error al enviar email');
    }
  };

  // ========================================
  // Render States
  // ========================================

  if (isLoading) {
    return <SecuritySkeleton />;
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
        title="Seguridad"
        description="Gestiona la seguridad de tu cuenta"
      />

      <Card className="bg-card/80 backdrop-blur-xl border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Cambiar Contraseña</CardTitle>
          </div>
          <CardDescription>
            Restablece tu contraseña desde tu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleResetPassword}
          >
            <Key className="h-4 w-4" />
            Restablecer contraseña
          </Button>

          <p className="text-xs text-muted-foreground">
            Se enviará un enlace de restablecimiento a <strong>{user.email}</strong>
          </p>
        </CardContent>
      </Card>

      {/* TODO: Agregar más opciones de seguridad */}
      {/* - Two-factor authentication */}
      {/* - Sesiones activas */}
      {/* - Historial de accesos */}
    </div>
  );
}
