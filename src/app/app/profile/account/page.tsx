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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Profile Components
import { ProfileAvatarUpload } from '@/features/profile/components/ProfileAvatarUpload';

// Layout
import { PageHeader } from '@/components/layout';

// Icons
import { User } from 'lucide-react';

function AccountSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountPage() {
  const { user, isLoading } = useAuth();

  // User Info
  const [username, setUsername] = React.useState('');
  const [currentUsername, setCurrentUsername] = React.useState('');

  // Initialize from user data
  React.useEffect(() => {
    if (user) {
      const name =
        user.user_metadata?.username || user.email?.split('@')[0] || '';
      setUsername(name);
      setCurrentUsername(name);
    }
  }, [user]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleAvatarUpload = async (file: File) => {
    // TODO: Implementar backend
    // 1. const publicUrl = await uploadAvatar(user.id, file)
    // 2. await updateAvatarUrl(publicUrl)
    // 3. toast.success('Avatar actualizado')

    console.log('TODO: Upload avatar', file.name);
    toast.info('Backend no implementado aún', {
      description: 'La funcionalidad de subir avatar estará disponible pronto',
    });
  };

  const handleUpdateUsername = async () => {
    // TODO: Implementar backend
    // 1. await updateUsername(username)
    // 2. setCurrentUsername(username)
    // 3. toast.success('Nombre actualizado')

    console.log('TODO: Update username to', username);
    toast.info('Backend no implementado aún', {
      description:
        'La funcionalidad de actualizar nombre estará disponible pronto',
    });
  };

  // ========================================
  // Render States
  // ========================================

  if (isLoading) {
    return <AccountSkeleton />;
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
        title="Mi Perfil"
        description="Gestiona tu información personal"
      />

      {/* Hero Section - Avatar + Info básica */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Información Personal</CardTitle>
          </div>
          <CardDescription>
            Actualiza tu avatar y nombre de usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center">
            {/* Avatar Upload */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <ProfileAvatarUpload
                currentAvatarUrl={user?.user_metadata?.avatar_url}
                username={username}
                onFileSelect={handleAvatarUpload}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4 w-full">
              {/* Username - Editable */}
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu nombre de usuario"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleUpdateUsername}
                    disabled={username === currentUsername}
                  >
                    Guardar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Este nombre se mostrará en tus reseñas y actividad pública
                </p>
              </div>

              {/* Email - Read-only */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar. Contacta soporte si necesitas
                  actualizarlo.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
