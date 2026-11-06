import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronsUpDown, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { selectUnreadCount } from '../../store/slices/notificationSlice';
import { ROLE_LABELS } from '../../lib/constants';
import { cx } from '../../lib/format';
import { Avatar } from '../ui/Layout';
import { PageLoader } from '../ui/Feedback';
import { BrandLogo } from './BrandMark';
import { NAV_ITEMS } from './navigation';
import type { User } from '../../types';

function useSignOut() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };
}

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const signOut = useSignOut();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const itemClass =
    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:ring-0';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
      >
        <Avatar name={user.name} className="h-8 w-8" />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-[10rem] truncate text-sm font-semibold leading-tight text-slate-800">{user.name}</span>
          <span className="block text-xs leading-tight text-slate-500">{ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-64 origin-top-right animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-raised"
        >
          <div className="mb-1 flex items-center gap-3 rounded-lg bg-slate-50 px-2.5 py-2.5">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              navigate('/profile');
            }}
          >
            <UserIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Your profile
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            <LogOut className="h-4 w-4 text-slate-400" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function SidebarNav({ user }: { user: User }) {
  const items = NAV_ITEMS[user.role];
  const unread = useAppSelector(selectUnreadCount);
  const signOut = useSignOut();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link to="/dashboard" aria-label="Go to dashboard">
          <BrandLogo inverted />
        </Link>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Workspace</p>
          <ul className="space-y-0.5">
            {items.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} end className={linkClass}>
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cx('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')}
                        aria-hidden="true"
                      />
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Account</p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/notifications" end className={linkClass}>
                {({ isActive }) => (
                  <>
                    <Bell
                      className={cx('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')}
                      aria-hidden="true"
                    />
                    Notifications
                    {unread > 0 && (
                      <span className="ml-auto rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">{unread}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" end className={linkClass}>
                {({ isActive }) => (
                  <>
                    <UserIcon
                      className={cx('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand-300' : 'text-slate-500 group-hover:text-slate-300')}
                      aria-hidden="true"
                    />
                    Profile
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={user.name} className="ring-slate-900" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">
              {ROLE_LABELS[user.role]} · {user.department}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

const todayLabel = () =>
  new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

export function AppShell() {
  const user = useAppSelector((s) => s.auth.user);
  const unread = useAppSelector(selectUnreadCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-slate-950 lg:block">
        <SidebarNav user={user} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" id="mobile-nav">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-fade-in bg-slate-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarNav user={user} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-content items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-ml-1 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/dashboard" className="lg:hidden" aria-label="Go to dashboard">
              <BrandLogo />
            </Link>
            <p className="hidden text-sm text-slate-500 lg:block">{todayLabel()}</p>

            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/notifications"
                className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
              <UserMenu user={user} />
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-content animate-fade-in px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10" key={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
