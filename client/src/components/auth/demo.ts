import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { demoLogin } from '../../store/slices/authSlice';
import type { Role } from '../../types';

/** Set VITE_DEMO_LOGIN=false to hide the one-click demo accounts. */
export const DEMO_ENABLED = import.meta.env.VITE_DEMO_LOGIN !== 'false';

export const DEMO_ROLES: { role: Role; label: string; hint: string; icon: LucideIcon }[] = [
  { role: 'employee', label: 'Employee', hint: 'Apply for leave', icon: UserRound },
  { role: 'manager', label: 'Manager', hint: 'Review requests', icon: Briefcase },
  { role: 'admin', label: 'Admin', hint: 'Manage everything', icon: ShieldCheck },
];

/** Signs in as a shared demo account and continues to `next` on success. */
export function useDemoLogin(next = '/dashboard') {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [demoRole, setDemoRole] = useState<Role | null>(null);

  const signInAsDemo = async (role: Role) => {
    setDemoRole(role);
    const result = await dispatch(demoLogin(role));
    setDemoRole(null);
    if (demoLogin.fulfilled.match(result)) navigate(next, { replace: true });
    return demoLogin.fulfilled.match(result);
  };

  return { demoRole, signInAsDemo };
}
