'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROFILE_NAV_ITEMS } from '../config/profile-nav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { signout } from '@/features/auth/actions';
import { toast } from 'sonner';

interface ProfileSidebarProps {
  className?: string;
}

export function ProfileSidebar({ className }: ProfileSidebarProps) {
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signout();
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <>
      <aside
        role="navigation"
        aria-label="Navegación de perfil"
        className={cn(
          'w-80 sticky top-20',
          'bg-card/20 backdrop-blur-xl border border-border/40 rounded-lg',
          'p-6 space-y-2',
          className
        )}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Mi Cuenta</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tu perfil y preferencias
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {PROFILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href!}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  'transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  isActive
                    ? 'bg-primary/10 border border-primary/30 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/30'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.label}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-border/40 my-4" />

        {/* Logout Button */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 px-4 py-3',
            'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            'transition-colors duration-200'
          )}
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm">Cerrar sesión</span>
        </Button>
      </aside>

      {/* Dialog de confirmación de logout */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
