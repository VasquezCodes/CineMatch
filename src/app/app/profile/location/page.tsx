'use client';

import * as React from 'react';
import { useAuth } from '@/lib/providers/auth-provider';
import { toast } from 'sonner';
import { getProfile, updateLocation } from '@/features/profile/actions';

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
  const [isSaving, setIsSaving] = React.useState(false);

  // Location
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [neighborhood, setNeighborhood] = React.useState('');

  // Initialize from user data
  React.useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const profile = await getProfile();
      if (profile?.location_text) {
        // Simple parse: "Barrio, Ciudad, Estado"
        // Si el formato no coincide exacto, al menos ponemos todo en ciudad o algo
        // Por ahora asumimos que el usuario lo llenó con este form
        const parts = profile.location_text.split(',').map(s => s.trim());

        // Intentamos asignar de atrás para adelante: Estado, Ciudad, Barrio
        if (parts.length >= 1) setState(parts[parts.length - 1]);
        if (parts.length >= 2) setCity(parts[parts.length - 2]);
        if (parts.length >= 3) setNeighborhood(parts[parts.length - 3]);
      }
    }

    loadProfile();
  }, [user]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleUpdateLocation = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      await updateLocation({ city, state, neighborhood });
      toast.success('Ubicación actualizada');
    } catch (error) {
      toast.error('Error al actualizar ubicación');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Guardando...' : 'Guardar ubicación'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
