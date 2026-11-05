// Leave and holiday dates are calendar days with no time component. They are
// stored as UTC midnight so a date entered as "2025-03-14" is the same day for
// every server and browser regardless of time zone.

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" into a UTC-midnight Date, or null when invalid. */
function parseDateOnly(value) {
  if (typeof value !== 'string') return null;
  const match = DATE_ONLY.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // Reject roll-overs such as 2025-02-30.
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

/** UTC midnight of the given instant. */
function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Inclusive number of calendar days between two date-only values. */
function countDaysInclusive(start, end) {
  return Math.round((startOfUtcDay(end) - startOfUtcDay(start)) / DAY_MS) + 1;
}

function yearRange(year) {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year, 11, 31)),
  };
}

/** First instant of the month `monthsBack - 1` months before the current one. */
function monthWindowStart(monthsBack, now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));
}

/**
 * Turn aggregation rows keyed by {year, month} into a continuous series that
 * covers every month of the window, filling gaps with zeros so charts do not
 * silently skip empty months.
 */
function buildMonthlySeries(rows, monthsBack, fields = ['count'], now = new Date()) {
  const byKey = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row]));
  const start = monthWindowStart(monthsBack, now);
  const series = [];
  for (let i = 0; i < monthsBack; i += 1) {
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const row = byKey.get(`${year}-${month}`);
    const point = { year, month };
    fields.forEach((field) => {
      point[field] = row ? row[field] || 0 : 0;
    });
    series.push(point);
  }
  return series;
}

module.exports = {
  DAY_MS,
  parseDateOnly,
  startOfUtcDay,
  addDays,
  countDaysInclusive,
  yearRange,
  monthWindowStart,
  buildMonthlySeries,
};
