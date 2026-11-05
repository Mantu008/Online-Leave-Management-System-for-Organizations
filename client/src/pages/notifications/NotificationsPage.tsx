import { CalendarDays, FileText, Info, UserPlus, type LucideIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearNotifications, markAllAsRead, markAsRead, selectUnreadCount } from '../../store/slices/notificationSlice';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Feedback';
import { PageHeader, Panel } from '../../components/ui/Layout';
import { formatDateTime, formatRelative } from '../../lib/dates';
import { cx } from '../../lib/format';
import type { NotificationType } from '../../types';

const ICONS: Record<NotificationType, LucideIcon> = {
  leave: FileText,
  holiday: CalendarDays,
  user: UserPlus,
  system: Info,
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.notifications.items);
  const unread = useAppSelector(selectUnreadCount);
  const realtimeEnabled = Boolean(import.meta.env.VITE_APP_SOCKET_URL);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates received during this session."
        actions={
          items.length > 0 && (
            <>
              <Button variant="secondary" onClick={() => dispatch(markAllAsRead())} disabled={unread === 0}>
                Mark all as read
              </Button>
              <Button variant="ghost" onClick={() => dispatch(clearNotifications())}>
                Clear
              </Button>
            </>
          )
        }
      />

      <Panel>
        {items.length === 0 ? (
          <EmptyState
            title="No notifications"
            description={
              realtimeEnabled
                ? 'Leave decisions, new requests and holiday announcements will appear here as they happen.'
                : 'Live notifications are not enabled on this deployment.'
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => {
              const Icon = ICONS[n.type] ?? Info;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => dispatch(markAsRead(n.id))}
                    className={cx(
                      'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 sm:px-5',
                      !n.read && 'bg-brand-50/40'
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className={cx('block', n.read ? 'text-slate-600' : 'font-medium text-slate-900')}>{n.message}</span>
                      <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)} className="mt-0.5 block text-xs text-slate-500">
                        {formatRelative(n.createdAt)}
                      </time>
                    </span>
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600">
                        <span className="sr-only">Unread</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
