import { where } from 'firebase/firestore';
import {
  deleteDocumentById,
  getDocumentById,
  queryCollection,
  setDocumentById,
} from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import { formatMonthKey, parseDateKey } from '@/utils/dateUtils';
import type {
  DieselDistributionEntry,
  DieselDistributionEntryDraft,
} from '@/types/dieselDistribution';

function buildDieselDistributionId(
  ownerId: string,
  date: string,
  driverId: string,
): string {
  return `${ownerId}_${date}_${driverId}`;
}

export async function fetchDieselDistributionForDate(
  date: string,
): Promise<DieselDistributionEntry[]> {
  return queryCollection<DieselDistributionEntry>(
    FIRESTORE_COLLECTIONS.dieselDistributions,
    [where('ownerId', '==', getCurrentUserId()), where('date', '==', date)],
  );
}

export async function fetchDieselDistributionEntry(
  date: string,
  driverId: string,
): Promise<DieselDistributionEntry | null> {
  return getDocumentById<DieselDistributionEntry>(
    FIRESTORE_COLLECTIONS.dieselDistributions,
    buildDieselDistributionId(getCurrentUserId(), date, driverId),
  );
}

export async function saveDieselDistributionEntries(
  date: string,
  drafts: DieselDistributionEntryDraft[],
): Promise<DieselDistributionEntry[]> {
  const ownerId = getCurrentUserId();
  const month = formatMonthKey(parseDateKey(date));
  const existingEntries = await fetchDieselDistributionForDate(date);
  const existingByDriverId = new Map(
    existingEntries.map(entry => [entry.driverId, entry]),
  );
  const keepDriverIds = new Set(drafts.map(draft => draft.driverId));

  await Promise.all(
    existingEntries
      .filter(entry => !keepDriverIds.has(entry.driverId))
      .map(entry =>
        deleteDocumentById(FIRESTORE_COLLECTIONS.dieselDistributions, entry.id),
      ),
  );

  return Promise.all(
    drafts.map(async draft => {
      const id = buildDieselDistributionId(ownerId, date, draft.driverId);
      const entry: DieselDistributionEntry = {
        id,
        ownerId,
        date,
        month,
        driverId: draft.driverId,
        driverName: draft.driverName,
        vehicleNumber: draft.vehicleNumber,
        litres: draft.litres,
        createdAt:
          existingByDriverId.get(draft.driverId)?.createdAt ??
          new Date().toISOString(),
      };
      await setDocumentById(
        FIRESTORE_COLLECTIONS.dieselDistributions,
        id,
        entry,
      );
      return entry;
    }),
  );
}
