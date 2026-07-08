import {
  computeEffectiveDriverPay,
  fetchDailyEntriesForMonth,
} from '@/services/dailyEntryService';
import { getDocumentById, setDocumentById } from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { roundToTwoDecimals } from '@/utils/currencyUtils';
import type { DailyEntry } from '@/types/dailyEntry';
import type { MonthlyPayment } from '@/types/payment';

function buildMonthlyPaymentId(
  ownerId: string,
  driverId: string,
  monthKey: string,
): string {
  return `${ownerId}_${driverId}_${monthKey}`;
}

function aggregateDriverEntries(
  ownerId: string,
  driverId: string,
  driverName: string,
  monthKey: string,
  entries: DailyEntry[],
): MonthlyPayment {
  const monthlyEntries = entries.filter(
    entry => entry.settlementType === 'monthly',
  );
  const sameDayEntries = entries.filter(
    entry => entry.settlementType === 'sameDay',
  );

  const daysPresent = monthlyEntries.filter(
    entry => entry.attendance === 'present',
  ).length;

  const totalAmount = roundToTwoDecimals(
    monthlyEntries.reduce(
      (sum, entry) => sum + computeEffectiveDriverPay(entry),
      0,
    ),
  );

  const amountSettledSameDay = roundToTwoDecimals(
    sameDayEntries.reduce(
      (sum, entry) => sum + computeEffectiveDriverPay(entry),
      0,
    ),
  );

  return {
    id: buildMonthlyPaymentId(ownerId, driverId, monthKey),
    ownerId,
    driverId,
    driverName,
    month: monthKey,
    daysPresent,
    totalAmount,
    amountSettledSameDay,
    amountDue: totalAmount,
    paymentStatus: 'unpaid',
    paidAt: null,
  };
}

export async function computeMonthlyPayments(
  monthKey: string,
): Promise<MonthlyPayment[]> {
  const ownerId = getCurrentUserId();
  const entries = await fetchDailyEntriesForMonth(monthKey);
  const entriesByDriver = new Map<string, DailyEntry[]>();

  for (const entry of entries) {
    const driverEntries = entriesByDriver.get(entry.driverId) ?? [];
    driverEntries.push(entry);
    entriesByDriver.set(entry.driverId, driverEntries);
  }

  const monthlyPayments = await Promise.all(
    Array.from(entriesByDriver.entries()).map(
      async ([driverId, driverEntries]) => {
        const firstEntry = driverEntries[0];
        const driverName =
          firstEntry === undefined ? '' : firstEntry.driverName;
        const aggregate = aggregateDriverEntries(
          ownerId,
          driverId,
          driverName,
          monthKey,
          driverEntries,
        );

        const existingPayment = await getDocumentById<MonthlyPayment>(
          FIRESTORE_COLLECTIONS.monthlyPayments,
          aggregate.id,
        );

        if (existingPayment?.paymentStatus === 'paid') {
          return {
            ...aggregate,
            paymentStatus: existingPayment.paymentStatus,
            paidAt: existingPayment.paidAt,
          };
        }

        return aggregate;
      },
    ),
  );

  return monthlyPayments;
}

export async function markMonthlyPaymentPaid(
  payment: MonthlyPayment,
): Promise<MonthlyPayment> {
  const paidPayment: MonthlyPayment = {
    ...payment,
    paymentStatus: 'paid',
    paidAt: new Date().toISOString(),
  };
  await setDocumentById(
    FIRESTORE_COLLECTIONS.monthlyPayments,
    paidPayment.id,
    paidPayment,
  );
  return paidPayment;
}

export async function markMonthlyPaymentUnpaid(
  payment: MonthlyPayment,
): Promise<MonthlyPayment> {
  const unpaidPayment: MonthlyPayment = {
    ...payment,
    paymentStatus: 'unpaid',
    paidAt: null,
  };
  await setDocumentById(
    FIRESTORE_COLLECTIONS.monthlyPayments,
    unpaidPayment.id,
    unpaidPayment,
  );
  return unpaidPayment;
}
