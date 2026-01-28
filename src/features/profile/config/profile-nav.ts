import {
  User,
  Settings,
  Library,
  MapPin,
  KeyRound,
  HelpCircle,
  LogOut,
  LucideIcon,
} from 'lucide-react';

export interface ProfileNavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  description: string;
  isDivider?: boolean;
  isAction?: boolean;
  action?: () => void;
}

export const PROFILE_NAV_ITEMS: ProfileNavItem[] = [
  {
    label: 'Mi perfil',
    href: '/app/profile/account',
    icon: User,
    description: 'Cambiar nombre y avatar',
  },
  {
    label: 'Configuraciones',
    href: '/app/profile/settings',
    icon: Settings,
    description: 'Preferencias de apariencia',
  },
  {
    label: 'Mis películas',
    href: '/app/profile/library',
    icon: Library,
    description: 'Biblioteca personal',
  },
  {
    label: 'Dirección',
    href: '/app/profile/location',
    icon: MapPin,
    description: 'Ubicación',
  },
  {
    label: 'Cambiar contraseña',
    href: '/app/profile/security',
    icon: KeyRound,
    description: 'Seguridad',
  },
  {
    label: 'Ayuda y soporte',
    href: '/app/profile/support',
    icon: HelpCircle,
    description: 'Centro de ayuda',
  },
];
