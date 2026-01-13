# Guía de Integración Backend: Historial de Importaciones

Esta documentación detalla las Server Actions disponibles en `@/features/import/actions.ts` para gestionar el historial de importaciones.

## Conceptos Clave
- **Borrado Inteligente**: El sistema permite eliminar una importación sin borrar las películas que también fueron cargadas en otros archivos. Esto preserva la biblioteca del usuario.
- **Worker Idempotente**: El procesamiento se realiza en background y es seguro ante reintentos.

## API Reference

### 1. `getImports`
Recupera el listado de archivos importados por el usuario actual.

**Firma**:
```typescript
export async function getImports(): Promise<UserImport[]>
```

**Retorno (`UserImport`)**:
```typescript
{
    id: string;          // UUID único del import
    filename: string;    // Nombre del archivo original
    imported_at: string; // Timestamp ISO
    status: string;      // 'processing' | 'completed' | 'failed'
    counts: {
        total: number;   // Total de filas en el CSV
        new: number;     // Nuevas películas añadidas
        updated: number; // Películas actualizadas
    }
}
```

### 2. `processImport`
Procesa la subida de un archivo CSV y encola las películas para su procesamiento.

**Firma**:
```typescript
export async function processImport(movies: CsvMovieImport[], filename: string): Promise<ImportResult>
```

**Parámetros**:
- `movies`: Array de objetos parseados del CSV (usando PapaParse en cliente).
- `filename`: Nombre del archivo (string), necesario para el registro de historial.

**Comportamiento**:
1. Crea un registro en la tabla `user_imports` con el `filename`.
2. Encola todas las películas en `import_queue` vinculándolas al nuevo `import_id`.
3. Dispara el worker de procesamiento en background.
4. Ejecuta `revalidatePath` para refrescar `/app/library`.

### 3. `deleteImport`
Elimina una importación específica y limpia los datos asociados de forma segura.

**Firma**:
```typescript
export async function deleteImport(importId: string): Promise<{ success: boolean }>
```

**Lógica de "Borrado Seguro"**:
1. Identifica todas las películas vinculadas a ese `importId`.
2. Verifica cuáles de esas películas NO están vinculadas a ninguna otra importación del usuario.
3. **Solo elimina** de la Watchlist (`watchlists`) y Reseñas (`reviews`) aquellas películas "huérfanas" (que solo existen en este import).
4. Borra el registro de `user_imports` (eliminando en cascada los vínculos en `import_items`).
5. Ejecuta `revalidatePath` para refrescar la UI.

---

## Notas de Integración
- **Manejo de Errores**: Todas las acciones pueden lanzar errores estándar (ej. "Unauthorized"). Se recomienda envolver las llamadas en try/catch.
- **Actualización de UI**: Las acciones `deleteImport` y `processImport` ya incluyen `revalidatePath`, por lo que las Server Components deberían reflejar los cambios automáticamente tras la ejecución exitosa.

---

## Snippets de Integración

### 1. Obtener Lista en Server Component
```tsx
// app/settings/imports/page.tsx
import { getImports } from '@/features/import/actions';

export default async function ImportsPage() {
    const imports = await getImports();

    return <ImportsTableWrapper data={imports} />;
}
```

### 2. Borrar Importación en Client Component
```tsx
// features/import/components/DeleteImportButton.tsx
'use client';
import { deleteImport } from '@/features/import/actions';
import { toast } from 'sonner';

export function DeleteImportButton({ id }: { id: string }) {
    const handleDelete = async () => {
        try {
            await deleteImport(id);
            toast.success('Importación eliminada correctamente');
        } catch (error) {
            toast.error('Error eliminando importación');
            console.error(error);
        }
    };

    return (
        <button onClick={handleDelete} className="text-red-500">
            Eliminar
        </button>
    );
}
```
