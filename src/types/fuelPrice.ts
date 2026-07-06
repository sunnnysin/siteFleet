export interface FuelPrice {
  id: string;
  ownerId: string;
  date: string;
  month: string;
  pricePerLitre: number;
  setAt: string;
}

export type FuelPriceDraft = Omit<
  FuelPrice,
  'id' | 'ownerId' | 'month' | 'setAt'
>;
