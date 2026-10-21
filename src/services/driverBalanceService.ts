import { computeDriverFuelBalance } from '@/services/dailyEntryService';
import { roundToTwoDecimals } from '@/utils/currencyUtils';
import type { DailyEntry } from '@/types/dailyEntry';
import type { Driver } from '@/types/driver';
import type { DriverAdvance } from '@/types/driverAdvance';
import type { DriverPayment } from '@/types/driverPayment';

export interface FuelDeduction {
  extraLitres: number;
  ratePerLitre: number;
  amount: number;
}

export interface DriverBalanceSummary {
  totalSalary: number;
  fuelDeduction: FuelDeduction;
  advanceTotal: number;
  paidTotal: number;
  carriedForward: number;
  remaining: number;
  isFullyPaid: boolean;
}

export interface DriverBalanceRecords {
  entries: DailyEntry[];
  advances: DriverAdvance[];
  payments: DriverPayment[];
}

export interface DriverBalanceRow {
  driverId: string;
  driverName: string;
  isDeleted: boolean;
  balance: DriverBalanceSummary;
  payments: DriverPayment[];
}

interface MonthlyTotals {
  salary: number;
  fuelDeduction: number;
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

export function computeFuelDeduction(entries: DailyEntry[]): FuelDeduction {
  const extraLitres = Math.max(computeDriverFuelBalance(entries), 0);
  const fueledEntries = entries.filter(entry => entry.fuelLitres > 0);
  const totalLitres = fueledEntries.reduce(
    (sum, entry) => sum + entry.fuelLitres,
    0,
  );
  const totalCost = fueledEntries.reduce(
    (sum, entry) => sum + entry.fuelCost,
    0,
  );
  const ratePerLitre =
    totalLitres > 0 ? roundToTwoDecimals(totalCost / totalLitres) : 0;

  return {
    extraLitres,
    ratePerLitre,
    amount: roundToTwoDecimals(extraLitres * ratePerLitre),
  };
}

function getTotalsForMonth(
  monthKey: string,
  dailyRate: number,
  records: DriverBalanceRecords,
): MonthlyTotals {
  const monthEntries = records.entries.filter(
    entry => entry.month === monthKey,
  );
  return {
    salary: computeSalaryForEntries(monthEntries, dailyRate),
    fuelDeduction: computeFuelDeduction(monthEntries).amount,
    advance: records.advances
      .filter(advance => advance.month === monthKey)
      .reduce((sum, advance) => sum + advance.amount, 0),
    paid: records.payments
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
  const records = { entries, advances, payments };
  const earlierMonths = new Set<string>();
  [...entries, ...advances, ...payments].forEach(record => {
    if (record.month < monthKey) {
      earlierMonths.add(record.month);
    }
  });

  let carriedForward = 0;
  earlierMonths.forEach(earlierMonth => {
    const totals = getTotalsForMonth(earlierMonth, dailyRate, records);
    carriedForward +=
      totals.salary - totals.fuelDeduction - totals.advance - totals.paid;
  });

  const current = getTotalsForMonth(monthKey, dailyRate, records);
  const remaining = roundToTwoDecimals(
    carriedForward +
      current.salary -
      current.fuelDeduction -
      current.advance -
      current.paid,
  );

  return {
    totalSalary: current.salary,
    fuelDeduction: computeFuelDeduction(
      entries.filter(entry => entry.month === monthKey),
    ),
    advanceTotal: roundToTwoDecimals(current.advance),
    paidTotal: roundToTwoDecimals(current.paid),
    carriedForward: roundToTwoDecimals(carriedForward),
    remaining,
    isFullyPaid: current.salary > 0 && remaining <= 0,
  };
}

function groupByDriver<T extends { driverId: string }>(
  records: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  records.forEach(record => {
    const existing = grouped.get(record.driverId);
    if (existing === undefined) {
      grouped.set(record.driverId, [record]);
    } else {
      existing.push(record);
    }
  });
  return grouped;
}

interface BalanceDriverSource {
  id: string;
  name: string;
  dailyRate: number;
  isDeleted: boolean;
}

function buildDriverSources(
  drivers: Driver[],
  groupedRecords: Map<string, unknown>[],
  entriesByDriver: Map<string, DailyEntry[]>,
): BalanceDriverSource[] {
  const liveSources = drivers.map(driver => ({
    id: driver.id,
    name: driver.name,
    dailyRate: driver.dailyRate,
    isDeleted: false,
  }));
  const liveIds = new Set(liveSources.map(source => source.id));
  const deletedIds = new Set<string>();
  groupedRecords.forEach(grouped => {
    grouped.forEach((_, driverId) => {
      if (!liveIds.has(driverId)) {
        deletedIds.add(driverId);
      }
    });
  });

  const deletedSources = Array.from(deletedIds).map(driverId => {
    const latestEntry = [...(entriesByDriver.get(driverId) ?? [])].sort(
      (first, second) => second.date.localeCompare(first.date),
    )[0];
    return {
      id: driverId,
      name: latestEntry?.driverName ?? 'Unknown driver',
      dailyRate: latestEntry?.dailyRate ?? 0,
      isDeleted: true,
    };
  });

  return [...liveSources, ...deletedSources];
}

export function computeAllDriverBalances(
  monthKey: string,
  drivers: Driver[],
  records: DriverBalanceRecords,
): DriverBalanceRow[] {
  const entriesByDriver = groupByDriver(records.entries);
  const advancesByDriver = groupByDriver(records.advances);
  const paymentsByDriver = groupByDriver(records.payments);

  return buildDriverSources(
    drivers,
    [entriesByDriver, advancesByDriver, paymentsByDriver],
    entriesByDriver,
  ).map(driver => {
    const driverPayments = paymentsByDriver.get(driver.id) ?? [];
    return {
      driverId: driver.id,
      driverName: driver.name,
      isDeleted: driver.isDeleted,
      balance: computeDriverBalance(
        monthKey,
        driver.dailyRate,
        entriesByDriver.get(driver.id) ?? [],
        advancesByDriver.get(driver.id) ?? [],
        driverPayments,
      ),
      payments: driverPayments.filter(payment => payment.month === monthKey),
    };
  });
}
