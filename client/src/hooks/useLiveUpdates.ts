import { useAppSelector } from '../store';

/**
 * Changes whenever a realtime notification arrives. Pass it as a `useAsync`
 * dependency so on-screen data (statuses, counts, lists) is re-fetched when
 * something it shows has changed elsewhere. Existing data stays visible while
 * the refresh runs.
 */
export function useLiveUpdates(): string | undefined {
  return useAppSelector((s) => s.notifications.items[0]?.id);
}
