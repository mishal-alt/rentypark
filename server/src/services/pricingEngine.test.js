import { calculateCharge } from './pricingEngine.js';

const basePlan = {
  firstHourRate: 2000, // paise = ₹20
  additionalHourRate: 1000, // ₹10
  gracePeriodMinutes: 0,
  dailyCap: null,
};

function minutesAfter(start, minutes) {
  return new Date(start.getTime() + minutes * 60000);
}

describe('calculateCharge', () => {
  const entry = new Date('2026-01-01T10:00:00Z');

  test('charges first hour rate for a stay under one hour', () => {
    const result = calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, 30), ratePlan: basePlan });
    expect(result.durationMinutes).toBe(30);
    expect(result.chargeAmount).toBe(2000);
  });

  test('rounds up partial hours beyond the first', () => {
    const result = calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, 90), ratePlan: basePlan });
    expect(result.durationMinutes).toBe(90);
    expect(result.chargeAmount).toBe(2000 + 1000); // 1h + rounded-up 2nd hour
  });

  test('charges exactly for whole hours with no rounding needed', () => {
    const result = calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, 120), ratePlan: basePlan });
    expect(result.chargeAmount).toBe(2000 + 1000); // exactly 2 hours
  });

  test('is free within the grace period', () => {
    const plan = { ...basePlan, gracePeriodMinutes: 10 };
    const result = calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, 5), ratePlan: plan });
    expect(result.chargeAmount).toBe(0);
  });

  test('charges full rate once duration exceeds the grace period', () => {
    const plan = { ...basePlan, gracePeriodMinutes: 10 };
    const result = calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, 11), ratePlan: plan });
    expect(result.chargeAmount).toBe(2000);
  });

  test('applies the daily cap for a long single-day stay', () => {
    const plan = { ...basePlan, dailyCap: 5000 };
    const result = calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, 600), ratePlan: plan }); // 10h -> 2000+9*1000=11000
    expect(result.chargeAmount).toBe(5000);
  });

  test('multiplies the daily cap across multi-day stays', () => {
    const plan = { ...basePlan, dailyCap: 5000 };
    const result = calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, MINUTES_PER_DAY_TEST * 2), ratePlan: plan });
    expect(result.chargeAmount).toBe(10000);
  });

  test('rejects an exitTime before entryTime', () => {
    expect(() => calculateCharge({ entryTime: entry, exitTime: minutesAfter(entry, -5), ratePlan: basePlan })).toThrow();
  });
});

const MINUTES_PER_DAY_TEST = 24 * 60;
