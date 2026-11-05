import type { Role } from '../../types';

export interface NavItem {
  to: string;
  label: string;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  employee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/leave/apply', label: 'Request leave' },
    { to: '/leave/history', label: 'My leave' },
    { to: '/holidays', label: 'Holidays' },
  ],
  manager: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/leave/requests', label: 'Requests' },
    { to: '/team', label: 'Team calendar' },
    { to: '/holidays', label: 'Holidays' },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/users', label: 'Users' },
    { to: '/holidays/manage', label: 'Holidays' },
  ],
};
