import { where } from 'firebase/firestore';
import {
  getDocumentById,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { fetchFuelPriceForDate } from '@/services/fuelPriceService';
import { formatMonthKey, parseDateKey } from '@/utils/dateUtils';
import { roundToTwoDecimals } from '@/utils/currencyUtils';
import type {
  DailyAssignmentDraft,
  DailyEntry,
  DailyFuelDraft,
} from '@/types/dailyEntry';

function buildDailyEntryId(
  ownerId: string,
  date: string,
  driverId: string,
): string {
  return `${ownerId}_${date}_${driverId}`;
}

export function computeEffectiveDriverPay(entry: DailyEntry): number {
  return entry.attendance === 'present' ? entry.dailyRate : 0;
}

export function computeEffectiveFuelCost(entry: DailyEntry): number {
  return entry.attendance === 'present' ? entry.fuelCost : 0;
}

export async function fetchDailyEntriesForDate(
  date: string,
): Promise<DailyEntry[]> {
  const entries = await queryCollection<DailyEntry>(
    FIRESTORE_COLLECTIONS.dailyEntries,
    [where('ownerId', '==', getCurrentUserId()), where('date', '==', date)],
  );
  return [...entries].sort((first, second) =>
    first.driverName.localeCompare(second.driverName),
  );
}

export async function fetchDailyEntriesForMonth(
  monthKey: string,
): Promise<DailyEntry[]> {
  return queryCollection<DailyEntry>(FIRESTORE_COLLECTIONS.dailyEntries, [
    where('ownerId', '==', getCurrentUserId()),
    where('month', '==', monthKey),
  ]);
}

export async function fetchDailyEntry(
  date: string,
  driverId: string,
): Promise<DailyEntry | null> {
  return getDocumentById<DailyEntry>(
    FIRESTORE_COLLECTIONS.dailyEntries,
    buildDailyEntryId(getCurrentUserId(), date, driverId),
  );
}

export async function fetchLatestAssignmentForDriver(
  driverId: string,
): Promise<DailyEntry | null> {
  const entries = await queryCollection<DailyEntry>(
    FIRESTORE_COLLECTIONS.dailyEntries,
    [
      where('ownerId', '==', getCurrentUserId()),
      where('driverId', '==', driverId),
    ],
  );
  return entries.reduce<DailyEntry | null>((latest, entry) => {
    if (latest === null || entry.date > latest.date) {
      return entry;
    }
    return latest;
  }, null);
}

export async function saveDailyAssignment(
  draft: DailyAssignmentDraft,
): Promise<DailyEntry> {
  const ownerId = getCurrentUserId();
  const id = buildDailyEntryId(ownerId, draft.date, draft.driverId);
  const existingEntry = await getDocumentById<DailyEntry>(
    FIRESTORE_COLLECTIONS.dailyEntries,
    id,
  );

  const dailyEntry: DailyEntry = {
    id,
    ownerId,
    date: draft.date,
    month: formatMonthKey(parseDateKey(draft.date)),
    driverId: draft.driverId,
    driverName: draft.driverName,
    vehicleType: draft.vehicleType,
    vehicleNumber: draft.vehicleNumber,
    route: draft.route,
    attendance: draft.attendance,
    dailyRate: existingEntry?.dailyRate ?? 0,
    fuelLitres: existingEntry?.fuelLitres ?? 0,
    fuelCost: existingEntry?.fuelCost ?? 0,
    settlementType: existingEntry?.settlementType ?? 'monthly',
    paymentStatus: existingEntry?.paymentStatus ?? 'unpaid',
    paidAt: existingEntry?.paidAt ?? null,
  };

  await setDocumentById(FIRESTORE_COLLECTIONS.dailyEntries, id, dailyEntry);
  return dailyEntry;
}

export async function saveDailyFuelEntry(
  date: string,
  driverId: string,
  draft: DailyFuelDraft,
): Promise<DailyEntry> {
  const fuelPrice = await fetchFuelPriceForDate(date);
  if (fuelPrice === null) {
    throw new Error(`No fuel price set for ${date}`);
  }

  const id = buildDailyEntryId(getCurrentUserId(), date, driverId);
  const existingEntry = await getDocumentById<DailyEntry>(
    FIRESTORE_COLLECTIONS.dailyEntries,
    id,
  );

  if (existingEntry === null) {
    throw new Error(`No assignment found for driver ${driverId} on ${date}`);
  }

  const dailyEntry: DailyEntry = {
    ...existingEntry,
    dailyRate: draft.dailyRate,
    fuelLitres: draft.fuelLitres,
    fuelCost: roundToTwoDecimals(draft.fuelLitres * fuelPrice.pricePerLitre),
    settlementType: draft.settlementType,
  };

  await setDocumentById(FIRESTORE_COLLECTIONS.dailyEntries, id, dailyEntry);
  return dailyEntry;
}

export async function markDailyEntryPaid(
  entry: DailyEntry,
): Promise<DailyEntry> {
  const paidEntry: DailyEntry = {
    ...entry,
    paymentStatus: 'paid',
    paidAt: new Date().toISOString(),
  };
  await setDocumentById(
    FIRESTORE_COLLECTIONS.dailyEntries,
    entry.id,
    paidEntry,
  );
  return paidEntry;
}
