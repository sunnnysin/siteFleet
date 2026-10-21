import { computeDriverBalance } from '@/services/driverBalanceService';
import type { DailyEntry } from '@/types/dailyEntry';
import type { DriverAdvance } from '@/types/driverAdvance';
import type { DriverPayment } from '@/types/driverPayment';

function buildEntries(month: string, daysPresent: number): DailyEntry[] {
  return Array.from({ length: daysPresent }, (_, index) => ({
    month,
    date: `${month}-${String(index + 1).padStart(2, '0')}`,
    attendance: 'present',
  })) as DailyEntry[];
}

function buildPayment(month: string, amount: number): DriverPayment {
  return { month, amount, date: `${month}-28` } as DriverPayment;
}

function buildAdvance(month: string, amount: number): DriverAdvance {
  return { month, amount, date: `${month}-10` } as DriverAdvance;
}

describe('computeDriverBalance', () => {
  it('shows the remaining amount after a partial payment', () => {
    const balance = computeDriverBalance(
      '2026-10',
      400,
      buildEntries('2026-10', 12),
      [],
      [buildPayment('2026-10', 4000)],
    );

    expect(balance.totalSalary).toBe(4800);
    expect(balance.paidTotal).toBe(4000);
    expect(balance.carriedForward).toBe(0);
    expect(balance.remaining).toBe(800);
  });

  it('carries the previous month remainder into the next month', () => {
    const entries = [
      ...buildEntries('2026-10', 12),
      ...buildEntries('2026-11', 10),
    ];
    const payments = [buildPayment('2026-10', 4400)];

    const october = computeDriverBalance('2026-10', 400, entries, [], payments);
    const november = computeDriverBalance(
      '2026-11',
      400,
      entries,
      [],
      payments,
    );

    expect(october.remaining).toBe(400);
    expect(november.carriedForward).toBe(400);
    expect(november.totalSalary).toBe(4000);
    expect(november.remaining).toBe(4400);
  });

  it('deducts advances and reports excess payment as negative', () => {
    const balance = computeDriverBalance(
      '2026-10',
      400,
      buildEntries('2026-10', 5),
      [buildAdvance('2026-10', 500)],
      [buildPayment('2026-10', 1800)],
    );

    expect(balance.advanceTotal).toBe(500);
    expect(balance.remaining).toBe(-300);
  });

  it('ignores payments made in later months', () => {
    const balance = computeDriverBalance(
      '2026-10',
      400,
      buildEntries('2026-10', 5),
      [],
      [buildPayment('2026-11', 1000)],
    );

    expect(balance.paidTotal).toBe(0);
    expect(balance.remaining).toBe(2000);
  });
});
