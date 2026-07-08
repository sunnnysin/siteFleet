import { DEFAULT_CURRENCY } from '@/theme/colors';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
  maximumFractionDigits: 2,
});

const wholeCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatCurrencyTrimmed(amount: number): string {
  return wholeCurrencyFormatter.format(amount);
}

export function roundToTwoDecimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}
