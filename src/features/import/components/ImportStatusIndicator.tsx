'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RefreshCw, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImportState = 'idle' | 'processing' | 'completed' | 'error';

/**
 * ImportStatusIndicator
 * 
 * Componente que muestra un toast flotante con el progreso de importación
 * en tiempo real usando Supabase Realtime.
 * 
 * - Se suscribe a cambios en la tabla `import_queue`
 * - Muestra el número de películas pendientes de procesar
 * - Cuando termina, ofrece opciones para navegar o refrescar
 */
export function ImportStatusIndicator() {
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [importState, setImportState] = useState<ImportState>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Función para refrescar la página actual
  const handleRefresh = useCallback(() => {
    router.refresh();
    setIsVisible(false);
    setImportState('idle');
  }, [router]);

  // Función para navegar al análisis
  const handleNavigateToAnalysis = useCallback(() => {
    router.push('/app/analysis');
    router.refresh();
    setIsVisible(false);
    setImportState('idle');
  }, [router]);

  // Auto-ocultar después de un tiempo si está completado
  useEffect(() => {
    if (importState === 'completed') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setImportState('idle');
      }, 15000); // 15 segundos antes de auto-ocultar
      return () => clearTimeout(timer);
    }
  }, [importState]);

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']>;
    const supabase = createClient();

    const setupRealtime = async () => {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Obtener conteo inicial de items pendientes
      const { count } = await supabase
        .from('import_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing']);

      if (count !== null && count > 0) {
        setPendingCount(count);
        setTotalCount(count);
        setIsVisible(true);
        setImportState('processing');
      }

      // 3. Suscribirse a cambios en la tabla import_queue
      channel = supabase
        .channel(`import-progress-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'import_queue',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('[ImportStatus] Realtime event:', payload.eventType, payload);

            // Si el evento es INSERT (usuario subió más), incrementar contador
            if (payload.eventType === 'INSERT') {
              setPendingCount(prev => {
                const newCount = prev + 1;
                setTotalCount(t => Math.max(t, newCount));
                if (newCount > 0) {
                  setIsVisible(true);
                  setImportState('processing');
                }
                return newCount;
              });
            }

            // Si el evento es DELETE (item procesado/limpiado), decrementar contador
            if (payload.eventType === 'DELETE') {
              setPendingCount(prev => Math.max(0, prev - 1));
            }

            // Si hay un error
            if (payload.eventType === 'UPDATE') {
              const newRecord = payload.new as { status?: string };
              if (newRecord.status === 'failed') {
                setImportState('error');
              }
            }
          }
        )
        .subscribe((status) => {
          console.log('[ImportStatus] Subscription status:', status);
          if (status === 'CHANNEL_ERROR') {
            console.warn('[ImportStatus] Realtime connection error (transient)');
          }
        });
    };

    setupRealtime();

    // Cleanup: desuscribirse al desmontar
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  // Efecto para detectar finalización
  useEffect(() => {
    if (importState === 'processing' && pendingCount === 0) {
      setImportState('completed');
      router.refresh();
    }
  }, [importState, pendingCount, router]);

  // No renderizar si no está visible
  if (!isVisible) return null;

  // Estado de procesamiento
  if (importState === 'processing') {
    const progress = totalCount > 0 ? Math.round(((totalCount - pendingCount) / totalCount) * 100) : 0;

    return (
      <div
        className="fixed bottom-4 right-4 bg-card border border-border px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5"
        role="status"
        aria-live="polite"
      >
        {/* Spinner animado */}
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />

        {/* Contenido */}
        <div className="flex flex-col min-w-[180px]">
          <span className="font-semibold text-sm text-foreground">Procesando películas...</span>
          <span className="text-xs text-muted-foreground">
            Faltan {pendingCount} de {totalCount} ({progress}%)
          </span>
          {/* Barra de progreso */}
          <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Estado completado
  if (importState === 'completed') {
    return (
      <div
        className="fixed bottom-4 right-4 bg-card border border-primary/30 px-4 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-5"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          {/* Icono de éxito */}
          <div className="rounded-full bg-primary/10 p-1.5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>

          {/* Contenido */}
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold text-sm text-foreground block">
                ¡Importación completada!
              </span>
              <span className="text-xs text-muted-foreground">
                {totalCount} película{totalCount !== 1 ? 's' : ''} procesada{totalCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs gap-1.5"
                onClick={handleNavigateToAnalysis}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Ver análisis
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refrescar
              </Button>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-2"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Estado de error
  if (importState === 'error') {
    return (
      <div
        className="fixed bottom-4 right-4 bg-destructive/10 border border-destructive/30 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5"
        role="alert"
      >
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-destructive">Error en la importación</span>
          <span className="text-xs text-muted-foreground">
            Algunas películas no pudieron procesarse
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors ml-2"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
}
