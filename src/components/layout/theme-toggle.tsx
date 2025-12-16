'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ThemeToggle
 * Placeholder mínimo para toggle de tema.
 * Por ahora solo muestra el icono sin funcionalidad.
 * TODO: Implementar lógica de dark mode cuando se requiera.
 */
export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      className="size-9"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

