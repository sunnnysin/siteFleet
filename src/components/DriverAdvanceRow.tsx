import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDisplayDateWithWeekday } from '@/utils/dateUtils';
import type { DriverAdvance } from '@/types/driverAdvance';

interface DriverAdvanceRowProps {
  advance: DriverAdvance;
  isLast?: boolean;
}

export function DriverAdvanceRow({
  advance,
  isLast = false,
}: DriverAdvanceRowProps) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Text style={styles.date}>
        {formatDisplayDateWithWeekday(advance.date)}
      </Text>
      <Text style={styles.amount}>{formatCurrency(advance.amount)}</Text>
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
    backgroundColor: `${colors.warning}0D`,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  date: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  amount: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '600',
  },
});
