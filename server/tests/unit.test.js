const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDateOnly, countDaysInclusive, buildMonthlySeries } = require('../utils/dates');
const { expandOccurrences } = require('../services/holidays');
const { escapeHtml } = require('../utils/email');

test('parseDateOnly accepts real calendar dates as UTC midnight', () => {
  assert.equal(parseDateOnly('2025-03-14').toISOString(), '2025-03-14T00:00:00.000Z');
  assert.equal(parseDateOnly('2024-02-29').toISOString(), '2024-02-29T00:00:00.000Z');
});

test('parseDateOnly rejects malformed and rolled-over dates', () => {
  ['2025-02-30', '2025-13-01', '2025-3-1', '14/03/2025', '', null, 20250314, { $gt: '' }].forEach((value) => {
    assert.equal(parseDateOnly(value), null, `expected ${JSON.stringify(value)} to be rejected`);
  });
});

test('countDaysInclusive counts both ends', () => {
  assert.equal(countDaysInclusive(parseDateOnly('2025-01-01'), parseDateOnly('2025-01-01')), 1);
  assert.equal(countDaysInclusive(parseDateOnly('2025-01-30'), parseDateOnly('2025-02-02')), 4);
  assert.equal(countDaysInclusive(parseDateOnly('2024-02-28'), parseDateOnly('2024-03-01')), 3);
});

test('buildMonthlySeries fills empty months with zeros', () => {
  const now = new Date(Date.UTC(2025, 2, 15)); // March 2025
  const rows = [{ _id: { year: 2025, month: 1 }, count: 4, approved: 3 }];
  const series = buildMonthlySeries(rows, 3, ['count', 'approved'], now);
  assert.deepEqual(series, [
    { year: 2025, month: 1, count: 4, approved: 3 },
    { year: 2025, month: 2, count: 0, approved: 0 },
    { year: 2025, month: 3, count: 0, approved: 0 },
  ]);
});

test('buildMonthlySeries crosses year boundaries', () => {
  const now = new Date(Date.UTC(2025, 0, 10));
  const series = buildMonthlySeries([], 2, ['count'], now);
  assert.deepEqual(series.map((p) => `${p.year}-${p.month}`), ['2024-12', '2025-1']);
});

test('expandOccurrences projects recurring holidays into later years only', () => {
  const holiday = { name: 'Foundation Day', date: new Date('2023-06-15T00:00:00Z'), isRecurring: true };
  const range = (y) => [new Date(Date.UTC(y, 0, 1)), new Date(Date.UTC(y, 11, 31))];

  const in2025 = expandOccurrences(holiday, ...range(2025));
  assert.equal(in2025.length, 1);
  assert.equal(in2025[0].date.toISOString(), '2025-06-15T00:00:00.000Z');
  assert.equal(in2025[0].isOccurrence, true);

  assert.equal(expandOccurrences(holiday, ...range(2022)).length, 0);
});

test('expandOccurrences skips 29 February in non-leap years', () => {
  const holiday = { name: 'Leap Day', date: new Date('2024-02-29T00:00:00Z'), isRecurring: true };
  assert.equal(expandOccurrences(holiday, new Date('2025-01-01T00:00:00Z'), new Date('2025-12-31T00:00:00Z')).length, 0);
  assert.equal(expandOccurrences(holiday, new Date('2028-01-01T00:00:00Z'), new Date('2028-12-31T00:00:00Z')).length, 1);
});

test('expandOccurrences keeps one-off holidays only inside the range', () => {
  const holiday = { name: 'Offsite', date: new Date('2025-05-02T00:00:00Z'), isRecurring: false };
  assert.equal(expandOccurrences(holiday, new Date('2025-05-01T00:00:00Z'), new Date('2025-05-31T00:00:00Z')).length, 1);
  assert.equal(expandOccurrences(holiday, new Date('2026-05-01T00:00:00Z'), new Date('2026-05-31T00:00:00Z')).length, 0);
});

test('escapeHtml neutralises markup in email content', () => {
  assert.equal(escapeHtml('<img src=x onerror="a()">'), '&lt;img src=x onerror=&quot;a()&quot;&gt;');
});
