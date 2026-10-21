import { where } from 'firebase/firestore';
import {
  deleteDocumentById,
  generateDocumentId,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { formatMonthKey, parseDateKey } from '@/utils/dateUtils';
import { roundToTwoDecimals } from '@/utils/currencyUtils';
import type { DriverPayment } from '@/types/driverPayment';

export interface DriverPaymentDraft {
  driverId: string;
  date: string;
  amount: number;
}

function sortPaymentsByDate(payments: DriverPayment[]): DriverPayment[] {
  return [...payments].sort(
    (first, second) =>
      first.date.localeCompare(second.date) ||
      first.createdAt.localeCompare(second.createdAt),
  );
}

export async function saveDriverPayment(
  draft: DriverPaymentDraft,
): Promise<DriverPayment> {
  const payment: DriverPayment = {
    id: generateDocumentId(FIRESTORE_COLLECTIONS.driverPayments),
    ownerId: getCurrentUserId(),
    driverId: draft.driverId,
    date: draft.date,
    month: formatMonthKey(parseDateKey(draft.date)),
    amount: roundToTwoDecimals(draft.amount),
    createdAt: new Date().toISOString(),
  };
  await setDocumentById(
    FIRESTORE_COLLECTIONS.driverPayments,
    payment.id,
    payment,
  );
  return payment;
}

export async function deleteDriverPayment(paymentId: string): Promise<void> {
  await deleteDocumentById(FIRESTORE_COLLECTIONS.driverPayments, paymentId);
}

export async function fetchAllDriverPayments(
  driverId: string,
): Promise<DriverPayment[]> {
  const payments = await queryCollection<DriverPayment>(
    FIRESTORE_COLLECTIONS.driverPayments,
    [
      where('ownerId', '==', getCurrentUserId()),
      where('driverId', '==', driverId),
    ],
  );
  return sortPaymentsByDate(payments);
}

export async function fetchAllOwnerDriverPayments(): Promise<DriverPayment[]> {
  const payments = await queryCollection<DriverPayment>(
    FIRESTORE_COLLECTIONS.driverPayments,
    [where('ownerId', '==', getCurrentUserId())],
  );
  return sortPaymentsByDate(payments);
}

export function filterPaymentsForMonth(
  payments: DriverPayment[],
  monthKey: string,
): DriverPayment[] {
  return payments.filter(payment => payment.month === monthKey);
}

export function computeTotalPaid(payments: DriverPayment[]): number {
  return roundToTwoDecimals(
    payments.reduce((sum, payment) => sum + payment.amount, 0),
  );
}
