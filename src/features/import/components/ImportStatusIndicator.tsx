'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * ImportStatusIndicator
 * 
 * Componente que muestra un toast flotante con el progreso de importación
 * en tiempo real usando Supabase Realtime.
 * 
 * - Se suscribe a cambios en la tabla `import_queue`
 * - Muestra el número de películas pendientes de procesar
 * - Solo visible cuando hay items en cola
 */
export function ImportStatusIndicator() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let channel: any;
    const supabase = createClient();

    const setupRealtime = async () => {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Obtener conteo inicial de items pendientes
      const { count } = await supabase
        .from('import_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (count !== null && count > 0) {
        setPendingCount(count);
        setIsVisible(true);
      }

      // 3. Suscribirse a cambios en la tabla import_queue
      channel = supabase
        .channel('import-progress')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'import_queue', 
            filter: `user_id=eq.${user.id}` 
          },
          (payload) => {
            // Si el evento es INSERT (usuario subió más), incrementar contador
            if (payload.eventType === 'INSERT') {
              setPendingCount(prev => {
                const newCount = prev + 1;
                if (newCount > 0) setIsVisible(true);
                return newCount;
              });
            }
            
            // Si el evento es DELETE (item procesado/limpiado), decrementar contador
            if (payload.eventType === 'DELETE') {
              setPendingCount(prev => {
                const newCount = Math.max(0, prev - 1);
                if (newCount === 0) {
                  // Ocultar después de un pequeño delay para mostrar la transición
                  setTimeout(() => setIsVisible(false), 1000);
                }
                return newCount;
              });
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    // Cleanup: desuscribirse al desmontar
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // No renderizar si no hay items pendientes
  if (!isVisible || pendingCount === 0) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5"
      role="status"
      aria-live="polite"
    >
      {/* Spinner animado */}
      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      
      {/* Contenido */}
      <div className="flex flex-col">
        <span className="font-semibold text-sm">Procesando películas...</span>
        <span className="text-xs opacity-90">
          Faltan {pendingCount} por importar
        </span>
      </div>
    </div>
  );
}

