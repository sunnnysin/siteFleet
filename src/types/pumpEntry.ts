export interface PumpEntry {
  id: string;
  ownerId: string;
  date: string;
  month: string;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  createdAt: string;
}

export interface PumpEntryDraft {
  date: string;
  litres: number;
}
