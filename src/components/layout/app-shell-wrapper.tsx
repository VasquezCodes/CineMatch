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

  return <AppShell navbarVariant={navbarVariant}>{children}</AppShell>;
}
