import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDisplayDateWithWeekdayNoYear } from '@/utils/dateUtils';
import type { DailyEntry } from '@/types/dailyEntry';

interface DriverHistoryRowProps {
  entry: DailyEntry;
  advanceAmount?: number;
  isLast?: boolean;
}

export function DriverHistoryRow({
  entry,
  advanceAmount,
  isLast = false,
}: DriverHistoryRowProps) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.dateColumn}>
        <Text style={styles.date}>
          {formatDisplayDateWithWeekdayNoYear(entry.date)}
        </Text>
        <Text style={styles.route}>{entry.route}</Text>
      </View>
      {entry.fuelLitres > 0 ? (
        <Text style={styles.fuel}>{entry.fuelLitres} L</Text>
      ) : null}
      {advanceAmount !== undefined && advanceAmount > 0 ? (
        <Text style={styles.advance}>{formatCurrency(advanceAmount)}</Text>
      ) : null}
      <Text
        style={[
          styles.attendance,
          entry.attendance === 'present'
            ? styles.presentText
            : styles.absentText,
        ]}
      >
        {entry.attendance === 'present' ? 'Present' : 'Absent'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dateColumn: {
    flex: 1.4,
  },
  date: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  route: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  fuel: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  advance: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  attendance: {
    ...typography.caption,
    flex: 1,
    textAlign: 'right',
  },
  presentText: {
    color: colors.success,
  },
  absentText: {
    color: colors.disabled,
  },
});
