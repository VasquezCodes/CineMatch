'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROFILE_NAV_ITEMS } from '../config/profile-nav';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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

interface ProfileMobileNavProps {
  className?: string;
}

export function ProfileMobileNav({ className }: ProfileMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
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
      <div className={cn('fixed bottom-24 left-6 z-[100]', className)}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] sm:w-[400px] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Mi Cuenta</SheetTitle>
              <SheetDescription>
                Gestiona tu perfil y preferencias
              </SheetDescription>
            </SheetHeader>

            {/* Navigation Items */}
            <nav className="mt-6 space-y-1" role="navigation">
              {PROFILE_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    onClick={() => setOpen(false)}
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
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
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
              onClick={() => {
                setOpen(false);
                setShowLogoutDialog(true);
              }}
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">Cerrar sesión</span>
            </Button>
          </SheetContent>
        </Sheet>
      </div>

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
