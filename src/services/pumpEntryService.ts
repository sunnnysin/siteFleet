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
import type { PumpEntry, PumpEntryDraft } from '@/types/pumpEntry';

function buildPumpEntryId(ownerId: string, date: string): string {
  return `${ownerId}_${date}`;
}

export async function fetchPumpEntryForDate(
  date: string,
): Promise<PumpEntry | null> {
  return getDocumentById<PumpEntry>(
    FIRESTORE_COLLECTIONS.pumpEntries,
    buildPumpEntryId(getCurrentUserId(), date),
  );
}

export async function savePumpEntryForDate(
  draft: PumpEntryDraft,
): Promise<PumpEntry> {
  const ownerId = getCurrentUserId();
  const fuelPrice = await fetchFuelPriceForDate(draft.date);
  if (fuelPrice === null) {
    throw new Error(`No fuel price set for ${draft.date}`);
  }

  const id = buildPumpEntryId(ownerId, draft.date);
  const pumpEntry: PumpEntry = {
    id,
    ownerId,
    date: draft.date,
    month: formatMonthKey(parseDateKey(draft.date)),
    litres: draft.litres,
    pricePerLitre: fuelPrice.pricePerLitre,
    totalCost: roundToTwoDecimals(draft.litres * fuelPrice.pricePerLitre),
    createdAt: new Date().toISOString(),
  };
  await setDocumentById(FIRESTORE_COLLECTIONS.pumpEntries, id, pumpEntry);
  return pumpEntry;
}

export async function fetchPumpEntriesForMonth(
  monthKey: string,
): Promise<PumpEntry[]> {
  const entries = await queryCollection<PumpEntry>(
    FIRESTORE_COLLECTIONS.pumpEntries,
    [
      where('ownerId', '==', getCurrentUserId()),
      where('month', '==', monthKey),
    ],
  );
  return [...entries].sort((first, second) =>
    second.date.localeCompare(first.date),
  );
}

export function computePumpEntriesTotals(entries: PumpEntry[]): {
  totalLitres: number;
  totalCost: number;
} {
  return {
    totalLitres: roundToTwoDecimals(
      entries.reduce((sum, entry) => sum + entry.litres, 0),
    ),
    totalCost: roundToTwoDecimals(
      entries.reduce((sum, entry) => sum + entry.totalCost, 0),
    ),
  };
}
