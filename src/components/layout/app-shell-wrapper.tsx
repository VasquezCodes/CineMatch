"use client";

import { usePathname } from "next/navigation";
import { AppShell, type NavbarVariant } from "./app-shell";

interface AppShellWrapperProps {
  children: React.ReactNode;
}

/**
 * AppShellWrapper
 * Wrapper cliente que detecta la ruta actual y determina
 * la variante del navbar apropiada.
 */
export function AppShellWrapper({ children }: AppShellWrapperProps) {
  const pathname = usePathname();

  // Determinar la variante del navbar basándose en la ruta
  const navbarVariant: NavbarVariant = pathname?.startsWith("/app/movies")
    ? "cinematic"
    : "default";

  // Determinar si es la página de landing (sin padding bottom)
  const isLandingPage = pathname === "/app";

  return (
    <AppShell navbarVariant={navbarVariant} isLandingPage={isLandingPage}>
      {children}
    </AppShell>
  );
}
