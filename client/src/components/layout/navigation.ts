import {
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  ClipboardCheck,
  History,
  LayoutDashboard,
  PartyPopper,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '../../types';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  employee: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leave/apply', label: 'Request leave', icon: CalendarPlus },
    { to: '/leave/history', label: 'My leave', icon: History },
    { to: '/holidays', label: 'Holidays', icon: PartyPopper },
  ],
  manager: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leave/requests', label: 'Requests', icon: ClipboardCheck },
    { to: '/team', label: 'Team calendar', icon: CalendarRange },
    { to: '/holidays', label: 'Holidays', icon: PartyPopper },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/users', label: 'People', icon: Users },
    { to: '/holidays/manage', label: 'Holidays', icon: CalendarDays },
  ],
};
