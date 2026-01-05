# Guía de Implementación: Feedback de Importación en Tiempo Real

Esta guía detalla cómo implementar un indicador visual de progreso para la importación de películas utilizando Supabase Realtime.

## Objetivo
Mostrar al usuario cuántas películas quedan por procesar en la cola de importación en tiempo real, sin necesidad de recargar la página.

## Requisitos Previos
1. El backend ya tiene habilitado Realtime en la tabla `import_queue`.
2. El cliente de Supabase (`createClient`) debe estar disponible en el frontend.

## Implementación en el Frontend

Recomendamos crear un componente global (ej. `ImportStatusToast.tsx` o dentro de `MainLayout`) que se monte una sola vez.

### Lógica del Componente

El componente debe hacer tres cosas:
1. **Obtener el estado inicial**: Consultar cuántos items pendientes tiene el usuario al cargar.
2. **Escuchar cambios**: Suscribirse a los eventos `INSERT` y `DELETE` de la tabla `import_queue`.
3. **Actualizar estado**: Incrementar o decrementar el contador en vivo.

### Código de Ejemplo (React/Next.js)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Ajustar ruta a tu cliente supabase

export function ImportStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      // 1. Obtener usuario actual 
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Obtener conteo inicial
      const { count, error } = await supabase
        .from('import_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'); 

      if (!error && count !== null) {
        setPendingCount(count);
      }

      // 3. Suscribirse a cambios
      channel = supabase
        .channel('import-progress')
        .on(
          'postgres_changes',
          {
            event: '*', // Escuchar INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'import_queue',
            filter: `user_id=eq.${user.id}`, // Filtramos por usuario
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // Nueva película agregada -> Incrementar
              setPendingCount((prev) => prev + 1);
            } else if (payload.eventType === 'DELETE') {
              // Película procesada (borrada) -> Decrementar
              setPendingCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    // Cleanup
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Renderizar solo si hay items procesando
  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      <div className="flex flex-col">
        <span className="font-semibold text-sm">Procesando importación...</span>
        <span className="text-xs opacity-90">{pendingCount} películas restantes</span>
      </div>
    </div>
  );
}
```

### Consideraciones
*   **Filtrado por Usuario**: Es crucial incluir `filter: user_id=eq.${user.id}` en la suscripción del canal. Aunque RLS protege los datos en `SELECT`, Realtime a veces puede emitir eventos globales si no se configura explícitamente el filtro en el cliente.
*   **Persistencia**: Coloca este componente en un Layout principal para que persista durante la navegación.
*   **Señal de Progreso**: El worker **borra** los items al completarlos, por lo que el evento `DELETE` reduce el contador.
