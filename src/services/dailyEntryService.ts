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
import type { DailyEntry, DailyEntryDraft } from '@/types/dailyEntry';
import type { Driver } from '@/types/driver';

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
  return queryCollection<DailyEntry>(FIRESTORE_COLLECTIONS.dailyEntries, [
    where('ownerId', '==', getCurrentUserId()),
    where('date', '==', date),
  ]);
}

export async function fetchDailyEntriesForMonth(
  monthKey: string,
): Promise<DailyEntry[]> {
  return queryCollection<DailyEntry>(FIRESTORE_COLLECTIONS.dailyEntries, [
    where('ownerId', '==', getCurrentUserId()),
    where('month', '==', monthKey),
  ]);
}

export async function fetchDailyEntriesForDriverAndMonth(
  driverId: string,
  monthKey: string,
): Promise<DailyEntry[]> {
  const entries = await queryCollection<DailyEntry>(
    FIRESTORE_COLLECTIONS.dailyEntries,
    [
      where('ownerId', '==', getCurrentUserId()),
      where('driverId', '==', driverId),
      where('month', '==', monthKey),
    ],
  );
  return [...entries].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
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

export async function saveDailyEntry(
  driver: Driver,
  draft: DailyEntryDraft,
): Promise<DailyEntry> {
  const ownerId = getCurrentUserId();
  const id = buildDailyEntryId(ownerId, draft.date, draft.driverId);
  const existingEntry = await getDocumentById<DailyEntry>(
    FIRESTORE_COLLECTIONS.dailyEntries,
    id,
  );

  let fuelCost = 0;
  if (draft.attendance === 'present' && draft.fuelLitres > 0) {
    const fuelPrice = await fetchFuelPriceForDate(draft.date);
    if (fuelPrice === null) {
      throw new Error(`No fuel price set for ${draft.date}`);
    }
    fuelCost = roundToTwoDecimals(draft.fuelLitres * fuelPrice.pricePerLitre);
  }

  const dailyEntry: DailyEntry = {
    id,
    ownerId,
    date: draft.date,
    month: formatMonthKey(parseDateKey(draft.date)),
    driverId: driver.id,
    driverName: driver.name,
    vehicleType: driver.vehicleType,
    vehicleNumber: driver.vehicleNumber,
    route: draft.route,
    attendance: draft.attendance,
    dailyRate: driver.dailyRate,
    fuelLitres: draft.fuelLitres,
    fuelCost,
    settlementType: driver.driverType === 'replacement' ? 'sameDay' : 'monthly',
    paymentStatus: existingEntry?.paymentStatus ?? 'unpaid',
    paidAt: existingEntry?.paidAt ?? null,
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
