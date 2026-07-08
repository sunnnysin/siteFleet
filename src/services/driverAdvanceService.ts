import { where } from 'firebase/firestore';
import { queryCollection, setDocumentById } from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { formatMonthKey, parseDateKey } from '@/utils/dateUtils';
import { roundToTwoDecimals } from '@/utils/currencyUtils';
import type { DriverAdvance } from '@/types/driverAdvance';

export interface DriverAdvanceDraft {
  driverId: string;
  date: string;
  amount: number;
}

function buildDriverAdvanceId(
  ownerId: string,
  date: string,
  driverId: string,
): string {
  return `${ownerId}_${date}_${driverId}`;
}

export async function saveDriverAdvance(
  draft: DriverAdvanceDraft,
): Promise<DriverAdvance> {
  const ownerId = getCurrentUserId();
  const advance: DriverAdvance = {
    id: buildDriverAdvanceId(ownerId, draft.date, draft.driverId),
    ownerId,
    driverId: draft.driverId,
    date: draft.date,
    month: formatMonthKey(parseDateKey(draft.date)),
    amount: draft.amount,
    createdAt: new Date().toISOString(),
  };
  await setDocumentById(
    FIRESTORE_COLLECTIONS.driverAdvances,
    advance.id,
    advance,
  );
  return advance;
}

export async function fetchDriverAdvancesForMonth(
  driverId: string,
  monthKey: string,
): Promise<DriverAdvance[]> {
  const advances = await queryCollection<DriverAdvance>(
    FIRESTORE_COLLECTIONS.driverAdvances,
    [
      where('ownerId', '==', getCurrentUserId()),
      where('driverId', '==', driverId),
      where('month', '==', monthKey),
    ],
  );
  return [...advances].sort((first, second) =>
    first.date.localeCompare(second.date),
  );
}

export function computeTotalAdvance(advances: DriverAdvance[]): number {
  return roundToTwoDecimals(
    advances.reduce((sum, advance) => sum + advance.amount, 0),
  );
}
