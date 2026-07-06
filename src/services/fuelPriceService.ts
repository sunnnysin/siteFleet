import { where } from 'firebase/firestore';
import {
  getDocumentById,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { formatMonthKey, parseDateKey } from '@/utils/dateUtils';
import type { FuelPrice, FuelPriceDraft } from '@/types/fuelPrice';

function buildFuelPriceId(ownerId: string, date: string): string {
  return `${ownerId}_${date}`;
}

export async function fetchFuelPriceForDate(
  date: string,
): Promise<FuelPrice | null> {
  return getDocumentById<FuelPrice>(
    FIRESTORE_COLLECTIONS.fuelPrices,
    buildFuelPriceId(getCurrentUserId(), date),
  );
}

export async function setFuelPriceForDate(
  draft: FuelPriceDraft,
): Promise<FuelPrice> {
  const ownerId = getCurrentUserId();
  const id = buildFuelPriceId(ownerId, draft.date);
  const fuelPrice: FuelPrice = {
    id,
    ownerId,
    date: draft.date,
    month: formatMonthKey(parseDateKey(draft.date)),
    pricePerLitre: draft.pricePerLitre,
    setAt: new Date().toISOString(),
  };
  await setDocumentById(FIRESTORE_COLLECTIONS.fuelPrices, id, fuelPrice);
  return fuelPrice;
}

export async function fetchFuelPricesForMonth(
  monthKey: string,
): Promise<FuelPrice[]> {
  const prices = await queryCollection<FuelPrice>(
    FIRESTORE_COLLECTIONS.fuelPrices,
    [
      where('ownerId', '==', getCurrentUserId()),
      where('month', '==', monthKey),
    ],
  );
  return [...prices].sort((first, second) =>
    second.date.localeCompare(first.date),
  );
}
