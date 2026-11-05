const Holiday = require('../models/Holiday');

/**
 * Project a recurring holiday onto every year in [start, end]. Returns the
 * occurrences that fall inside the range, never before the original date.
 * A 29 February holiday has no occurrence in non-leap years.
 */
function expandOccurrences(holiday, start, end) {
  const original = new Date(holiday.date);
  if (!holiday.isRecurring) {
    return original >= start && original <= end ? [{ ...holiday, date: original }] : [];
  }

  const month = original.getUTCMonth();
  const day = original.getUTCDate();
  const occurrences = [];
  const firstYear = Math.max(start.getUTCFullYear(), original.getUTCFullYear());
  for (let year = firstYear; year <= end.getUTCFullYear(); year += 1) {
    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCMonth() !== month) continue;
    if (date < start || date > end) continue;
    occurrences.push({
      ...holiday,
      date,
      // Lets clients edit the series using the date it was created with.
      originalDate: original,
      isOccurrence: year !== original.getUTCFullYear(),
    });
  }
  return occurrences;
}

/** All holidays (including recurring occurrences) between two UTC dates, inclusive. */
async function findHolidaysInRange(start, end) {
  const docs = await Holiday.find({
    $or: [
      { isRecurring: { $ne: true }, date: { $gte: start, $lte: end } },
      { isRecurring: true, date: { $lte: end } },
    ],
  }).lean();

  return docs
    .flatMap((doc) => expandOccurrences(doc, start, end))
    .sort((a, b) => a.date - b.date);
}

module.exports = { findHolidaysInRange, expandOccurrences };
