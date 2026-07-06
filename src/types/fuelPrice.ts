export interface FuelPrice {
  id: string;
  ownerId: string;
  date: string;
  pricePerLitre: number;
  setAt: string;
}

export type FuelPriceDraft = Omit<FuelPrice, 'id' | 'ownerId' | 'setAt'>;
