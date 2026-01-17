'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAV_ITEMS } from '@/config/nav';
import { cn } from '@/lib/utils';

/**
 * MobileTabs
 * Tabs fijas en bottom para navegación mobile.
 * Solo visible en viewport < md.
 */
export function MobileTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/50 md:hidden"
      role="navigation"
      aria-label="Navegación móvil"
    >
      <div className="flex items-center justify-around">
        {APP_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-3 px-1',
                'transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" suppressHydrationWarning />
              <span className="truncate text-xs font-medium w-full text-center">
                {item.mobileLabel || item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

