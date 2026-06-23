const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/**
 * Pure charge calculation — no DB access, no Date.now(). Given an entry/exit
 * time and a rate plan snapshot, returns durationMinutes and chargeAmount
 * (in the same currency unit as the rate plan, i.e. integer paise).
 *
 * Grace period exempts the *entire* session when total duration is within
 * it (a short "in and out" stay is free), rather than being deducted from
 * billable time on longer stays — this matches how grace periods are
 * marketed at physical parking stations.
 *
 * Daily cap is applied as `dailyCap * number of 24h periods spanned`, not
 * a strict per-calendar-day cap — a documented simplification for sessions
 * that cross midnight.
 */
export function calculateCharge({ entryTime, exitTime, ratePlan }) {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);

  if (Number.isNaN(entry.getTime()) || Number.isNaN(exit.getTime())) {
    throw new Error('Invalid entryTime or exitTime');
  }
  if (exit < entry) {
    throw new Error('exitTime cannot be before entryTime');
  }

  const durationMinutes = Math.round((exit.getTime() - entry.getTime()) / 60000);

  const gracePeriodMinutes = ratePlan.gracePeriodMinutes || 0;
  if (durationMinutes <= gracePeriodMinutes) {
    return { durationMinutes, chargeAmount: 0 };
  }

  const billedHours = Math.max(1, Math.ceil(durationMinutes / MINUTES_PER_HOUR));
  let chargeAmount = ratePlan.firstHourRate + Math.max(0, billedHours - 1) * ratePlan.additionalHourRate;

  if (ratePlan.dailyCap) {
    const daysSpanned = Math.max(1, Math.ceil(durationMinutes / MINUTES_PER_DAY));
    chargeAmount = Math.min(chargeAmount, ratePlan.dailyCap * daysSpanned);
  }

  return { durationMinutes, chargeAmount };
}
