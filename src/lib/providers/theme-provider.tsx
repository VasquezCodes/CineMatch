'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 * Wrapper de next-themes para manejar dark/light mode
 * Persiste la preferencia del usuario y sincroniza el tema en toda la app
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      {children}
    </NextThemesProvider>
  );
}

