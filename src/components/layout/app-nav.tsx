'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';
import type { NavbarVariant } from './app-shell';

interface AppNavProps {
  variant?: NavbarVariant;
}

/**
 * AppNav
 * Navegación principal horizontal para desktop.
 * Muestra links con estado activo basado en pathname.
 */
export function AppNav({ variant = "default" }: AppNavProps) {
  const pathname = usePathname();
  const isCinematic = variant === "cinematic";
  const isCinematicMobileVisible = variant === "cinematic-mobile-visible";

  return (
    <nav className="hidden md:flex md:items-center md:gap-1" role="navigation">
      {APP_NAV_ITEMS.map((item) => {
  const isActive = pathname === item.href;
  const Icon = item.icon;
if (item.disabled) {
  return (
    <span
      key={item.href}
      className="relative group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground cursor-default"
      aria-disabled="true"
    >
      <Icon className="size-4" aria-hidden="true" suppressHydrationWarning />
      <span>{item.label}</span>

      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
      >
        Próximamente
      </span>
    </span>
  );
}

  /*
   * Recomendaciones: cuando la funcionalidad esté terminada,
   * quitar disabled: true en nav.ts y volverá a funcionar como Link.
   *
   * Se conserva el Link original como referencia:
   *
   * <Link
   *   key={item.href}
   *   href={item.href}
   *   className={cn(
   *     'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
   *     isCinematic
   *       ? [
   *         'text-white hover:bg-white/15 hover:text-white',
   *         isActive ? 'bg-white/15 backdrop-blur-md border border-white/20' : ''
   *       ]
   *       : [
   *         'hover:bg-accent/10 dark:hover:bg-white/5 transition-colors',
   *         isActive
   *           ? 'bg-primary/10 backdrop-blur-md border border-primary/20 text-primary'
   *           : 'text-foreground'
   *       ]
   *   )}
   *   aria-current={isActive ? 'page' : undefined}
   * >
   *   <Icon className="size-4" aria-hidden="true" suppressHydrationWarning />
   *   <span>{item.label}</span>
   * </Link>
   */

  return (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        isCinematic
          ? [
            'text-white hover:bg-white/15 hover:text-white',
            isActive ? 'bg-white/15 backdrop-blur-md border border-white/20' : ''
          ]
          : [
            'hover:bg-accent/10 dark:hover:bg-white/5 transition-colors',
            isActive
              ? 'bg-primary/10 backdrop-blur-md border border-primary/20 text-primary'
              : 'text-foreground'
          ]
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="size-4" aria-hidden="true" suppressHydrationWarning />
      <span>{item.label}</span>
    </Link>
  );
})}
    </nav>
  );
}

