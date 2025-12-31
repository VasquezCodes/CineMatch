'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

/**
 * ThemeToggle
 * Toggle funcional para cambiar entre light/dark mode con animaciones suaves
 * Usa next-themes para persistir la preferencia del usuario
 * Usa Framer Motion para transiciones fluidas
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Mostrar un placeholder mientras se monta para evitar flash
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Cambiar tema"
        className="size-9"
      >
        <Sun className="size-4" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className="size-9 relative overflow-hidden"
      data-no-theme-transition
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            data-no-theme-transition
          >
            <Moon className="size-4" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            data-no-theme-transition
          >
            <Sun className="size-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

