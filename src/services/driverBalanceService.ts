import { roundToTwoDecimals } from '@/utils/currencyUtils';
import type { DailyEntry } from '@/types/dailyEntry';
import type { DriverAdvance } from '@/types/driverAdvance';
import type { DriverPayment } from '@/types/driverPayment';

export interface DriverBalanceSummary {
  totalSalary: number;
  advanceTotal: number;
  paidTotal: number;
  carriedForward: number;
  remaining: number;
}

interface MonthlyTotals {
  salary: number;
  advance: number;
  paid: number;
}

export function computeSalaryForEntries(
  entries: DailyEntry[],
  dailyRate: number,
): number {
  const daysPresent = entries.filter(
    entry => entry.attendance === 'present',
  ).length;
  return roundToTwoDecimals(daysPresent * dailyRate);
}

function getTotalsForMonth(
  monthKey: string,
  dailyRate: number,
  entries: DailyEntry[],
  advances: DriverAdvance[],
  payments: DriverPayment[],
): MonthlyTotals {
  return {
    salary: computeSalaryForEntries(
      entries.filter(entry => entry.month === monthKey),
      dailyRate,
    ),
    advance: advances
      .filter(advance => advance.month === monthKey)
      .reduce((sum, advance) => sum + advance.amount, 0),
    paid: payments
      .filter(payment => payment.month === monthKey)
      .reduce((sum, payment) => sum + payment.amount, 0),
  };
}

export function computeDriverBalance(
  monthKey: string,
  dailyRate: number,
  entries: DailyEntry[],
  advances: DriverAdvance[],
  payments: DriverPayment[],
): DriverBalanceSummary {
  const earlierMonths = new Set<string>();
  [...entries, ...advances, ...payments].forEach(record => {
    if (record.month < monthKey) {
      earlierMonths.add(record.month);
    }
  });

  let carriedForward = 0;
  earlierMonths.forEach(earlierMonth => {
    const totals = getTotalsForMonth(
      earlierMonth,
      dailyRate,
      entries,
      advances,
      payments,
    );
    carriedForward += totals.salary - totals.advance - totals.paid;
  });

  const current = getTotalsForMonth(
    monthKey,
    dailyRate,
    entries,
    advances,
    payments,
  );

  return {
    totalSalary: current.salary,
    advanceTotal: roundToTwoDecimals(current.advance),
    paidTotal: roundToTwoDecimals(current.paid),
    carriedForward: roundToTwoDecimals(carriedForward),
    remaining: roundToTwoDecimals(
      carriedForward + current.salary - current.advance - current.paid,
    ),
  };
}
