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

// Layout
import { PageHeader } from '@/components/layout';

// Icons
import { MapPin } from 'lucide-react';

function LocationSkeleton() {
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

export default function LocationPage() {
  const { user, isLoading } = useAuth();

  // Location
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [neighborhood, setNeighborhood] = React.useState('');

  // Initialize from user data
  React.useEffect(() => {
    if (user) {
      // TODO: Cargar ubicación desde profiles table
      // const profile = await getProfile(user.id);
      // setCity(profile.city || '');
      // setState(profile.state || '');
      // setNeighborhood(profile.neighborhood || '');
    }
  }, [user]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleUpdateLocation = async () => {
    // TODO: Implementar backend
    // await updateLocation({ city, state, neighborhood })
    // toast.success('Ubicación actualizada')

    console.log('TODO: Update location', { city, state, neighborhood });
    toast.info('Backend no implementado aún', {
      description:
        'La funcionalidad de actualizar ubicación estará disponible pronto',
    });
  };

  // ========================================
  // Render States
  // ========================================

  if (isLoading) {
    return <LocationSkeleton />;
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
        title="Dirección"
        description="Gestiona tu ubicación"
      />

      <Card className="bg-card/80 backdrop-blur-xl border-border/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Ubicación</CardTitle>
          </div>
          <CardDescription>
            Ayúdanos a personalizar tu experiencia según tu ubicación
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Grid responsive: 2 cols en desktop, 1 en mobile */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Buenos Aires"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Provincia/Estado</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="CABA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Barrio/Distrito (opcional)</Label>
            <Input
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Palermo"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleUpdateLocation}
            className="w-full sm:w-auto"
          >
            Guardar ubicación
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
