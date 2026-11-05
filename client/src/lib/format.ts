export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');
