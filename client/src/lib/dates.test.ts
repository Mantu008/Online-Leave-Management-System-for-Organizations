import { describe, expect, it } from 'vitest';
import { countDays, formatDate, monthLabels, overlapsMonth, toDateInputValue, todayInputValue } from './dates';

describe('countDays', () => {
  it('counts both the first and last day', () => {
    expect(countDays('2025-03-10', '2025-03-10')).toBe(1);
    expect(countDays('2025-03-10', '2025-03-14')).toBe(5);
  });

  it('handles month and leap-year boundaries', () => {
    expect(countDays('2024-02-28', '2024-03-01')).toBe(3);
    expect(countDays('2025-12-31', '2026-01-01')).toBe(2);
  });

  it('returns 0 for incomplete or reversed ranges', () => {
    expect(countDays('', '2025-03-10')).toBe(0);
    expect(countDays('2025-03-10', '2025-03-09')).toBe(0);
  });
});

describe('date-only values', () => {
  it('formats stored UTC-midnight dates as the same calendar day', () => {
    // Would render as 31 Dec in any time zone west of UTC without timeZone: 'UTC'.
    expect(formatDate('2025-01-01T00:00:00.000Z')).toMatch(/1/);
    expect(formatDate('2025-01-01T00:00:00.000Z')).toMatch(/2025/);
    expect(formatDate('2025-01-01T00:00:00.000Z')).not.toMatch(/31/);
  });

  it('converts stored dates to date-input values without shifting', () => {
    expect(toDateInputValue('2025-08-15T00:00:00.000Z')).toBe('2025-08-15');
    expect(toDateInputValue(undefined)).toBe('');
  });

  it("uses the user's local calendar for today", () => {
    const value = todayInputValue();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const now = new Date();
    expect(Number(value.slice(8, 10))).toBe(now.getDate());
  });

  it('detects leave that spans into a month', () => {
    // 30 Jan – 3 Feb overlaps February (month index 1).
    expect(overlapsMonth('2025-01-30T00:00:00Z', '2025-02-03T00:00:00Z', 2025, 1)).toBe(true);
    expect(overlapsMonth('2025-01-30T00:00:00Z', '2025-01-31T00:00:00Z', 2025, 1)).toBe(false);
  });

  it('labels monthly series with the year at the start and each January', () => {
    const labels = monthLabels([
      { year: 2024, month: 11 },
      { year: 2024, month: 12 },
      { year: 2025, month: 1 },
    ]);
    expect(labels[0]).toMatch(/24$/);
    expect(labels[1]).not.toMatch(/\d/);
    expect(labels[2]).toMatch(/25$/);
  });
});
