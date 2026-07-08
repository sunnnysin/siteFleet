export interface GoraulSummaryEntry {
  date: string;
  ace: number;
  bolero: number;
}

export interface GoraulSummary {
  id: string;
  ownerId: string;
  month: string;
  entries: GoraulSummaryEntry[];
  updatedAt: string;
}
