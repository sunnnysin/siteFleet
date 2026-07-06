import { DEFAULT_CURRENCY } from '@/theme/colors';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function roundToTwoDecimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}
