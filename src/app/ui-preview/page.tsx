import { UIPreview } from "@/components/ui/_ui-preview";

/**
 * Ruta temporal de desarrollo para visualizar el preview de componentes UI.
 * 
 * ⚠️ NO usar en producción. Eliminar antes de deploy.
 * 
 * Accede en: http://localhost:3000/ui-preview
 */
export default function UIPreviewPage() {
  return <UIPreview />;
}

