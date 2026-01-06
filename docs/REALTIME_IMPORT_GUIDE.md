# Guía de Implementación del Frontend: Importación y Worker

Esta guía detalla cómo se integra el Frontend con el nuevo sistema de importación optimizado (Background Worker).

## Resumen del Flujo
1.  **Frontend**: El usuario sube el CSV.
2.  **Server Action**: `processImport` valida el archivo, inserta los items en `import_queue` y **dispara automáticamente** el worker (Fire-and-Forget).
3.  **Worker (Backend)**: Procesa los items en bucle continuo hasta terminar o casi alcanzar el timeout (50s), auto-invocándose si es necesario.
4.  **Frontend (Feedback)**: El usuario ve el progreso mediante suscripción a Supabase Realtime (tabla `import_queue`).

## 1. Integración de la Carga (Upload)

La función `processImport` en `src/features/import/actions.ts` ya maneja todo. El frontend solo necesita llamarla.

**No es necesario llamar al worker manualmente desde el cliente.**

```typescript
// Ejemplo de uso en componente (ya implementado):
await processImport(movies);
```

## 2. Visualización de Progreso (Recomendado)

Para mostrar una barra de progreso o un "toast" flotante, utiliza Supabase Realtime escuchando la tabla `import_queue`.

### Ejemplo de Componente (`ImportStatusToast.tsx`)

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

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
      const { count } = await supabase
        .from('import_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (count !== null) setPendingCount(count);

      // 3. Suscribirse a DELETE (cuando el worker termina un item)
      channel = supabase
        .channel('import-progress')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'import_queue', filter: `user_id=eq.${user.id}` },
          (payload) => {
             // Si el evento es INSERT (usuario subió más), sube el contador
             if (payload.eventType === 'INSERT') setPendingCount(p => p + 1);
             // Si el evento es DELETE (item procesado/limpiado), baja el contador
             if (payload.eventType === 'DELETE') setPendingCount(p => Math.max(0, p - 1));
          }
        )
        .subscribe();
    };

    setupRealtime();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [supabase]);

  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      <div className="flex flex-col">
        <span className="font-semibold text-sm">Procesando películas...</span>
        <span className="text-xs opacity-90">Faltan {pendingCount} por importar</span>
      </div>
    </div>
  );
}
```

## 3. Debugging y Emergencias

Si la cola parece atascada (aunque el nuevo worker previene esto), los desarrolladores pueden usar:

*   **Página de Debug**: Visitar `/dev/worker` para ver el estado y botón de disparo manual.
*   **API Directa**: POST a `/api/dev/trigger-worker` (si se requiere disparar desde una herramienta externa).

## Notas Técnicas para el Equipo Frontend
*   El worker corre en lotes continuos de hasta 50-60 segundos. No se alarmen si la petición de red inicial (upload) termina rápido pero el contador baja progresivamente durante el siguiente minuto.
*   La tabla `import_queue` se limpia automáticamente (DELETE) a medida que se procesan los items.
