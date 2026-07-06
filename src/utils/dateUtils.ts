import { endOfMonth, format, parse, startOfMonth, subDays } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const MONTH_FORMAT = 'yyyy-MM';

export function formatDateKey(dateValue: Date): string {
  return format(dateValue, DATE_FORMAT);
}

export function formatMonthKey(dateValue: Date): string {
  return format(dateValue, MONTH_FORMAT);
}

export function parseDateKey(dateKey: string): Date {
  return parse(dateKey, DATE_FORMAT, new Date());
}

export function todayKey(): string {
  return formatDateKey(new Date());
}

export function currentMonthKey(): string {
  return formatMonthKey(new Date());
}

export function lastNDateKeys(
  count: number,
  fromDate: Date = new Date(),
): string[] {
  return Array.from({ length: count }, (_, index) =>
    formatDateKey(subDays(fromDate, index)),
  );
}

export function monthKeyToRange(monthKey: string): {
  start: string;
  end: string;
} {
  const parsedMonth = parse(monthKey, MONTH_FORMAT, new Date());
  return {
    start: formatDateKey(startOfMonth(parsedMonth)),
    end: formatDateKey(endOfMonth(parsedMonth)),
  };
}

export function formatDisplayDate(dateKey: string): string {
  return format(parseDateKey(dateKey), 'dd MMM yyyy');
}
