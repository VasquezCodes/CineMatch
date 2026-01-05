'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';

/**
 * AppNav
 * Navegación principal horizontal para desktop.
 * Muestra links con estado activo basado en pathname.
 */
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex md:items-center md:gap-1" role="navigation">
      {APP_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-muted hover:text-foreground',
              isActive
                ? 'bg-muted text-primary'
                : 'text-muted-foreground'
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

