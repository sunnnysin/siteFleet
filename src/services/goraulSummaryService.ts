import { getDocumentById, setDocumentById } from '@/firebase/firestore';
import { getCurrentUserId } from '@/firebase/auth';
import { FIRESTORE_COLLECTIONS } from '@/types/collections';
import type { GoraulSummary, GoraulSummaryEntry } from '@/types/goraulSummary';

function buildGoraulSummaryId(ownerId: string, month: string): string {
  return `${ownerId}_${month}`;
}

export async function fetchGoraulSummary(
  month: string,
): Promise<GoraulSummary | null> {
  return getDocumentById<GoraulSummary>(
    FIRESTORE_COLLECTIONS.goraulSummaries,
    buildGoraulSummaryId(getCurrentUserId(), month),
  );
}

export async function saveGoraulSummary(
  month: string,
  entries: GoraulSummaryEntry[],
): Promise<GoraulSummary> {
  const ownerId = getCurrentUserId();
  const id = buildGoraulSummaryId(ownerId, month);
  const goraulSummary: GoraulSummary = {
    id,
    ownerId,
    month,
    entries,
    updatedAt: new Date().toISOString(),
  };
  await setDocumentById(
    FIRESTORE_COLLECTIONS.goraulSummaries,
    id,
    goraulSummary,
  );
  return goraulSummary;
}

export function computeGoraulSummaryTotals(entries: GoraulSummaryEntry[]): {
  ace: number;
  bolero: number;
  total: number;
} {
  const ace = entries.reduce((sum, entry) => sum + entry.ace, 0);
  const bolero = entries.reduce((sum, entry) => sum + entry.bolero, 0);
  return { ace, bolero, total: ace + bolero };
}
