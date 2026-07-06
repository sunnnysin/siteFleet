import { StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDisplayDate } from '@/utils/dateUtils';
import { computeEffectiveDriverPay } from '@/services/dailyEntryService';
import type { DailyEntry } from '@/types/dailyEntry';

interface DriverHistoryRowProps {
  entry: DailyEntry;
}

export function DriverHistoryRow({ entry }: DriverHistoryRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.leftColumn}>
        <Text style={styles.date}>{formatDisplayDate(entry.date)}</Text>
        <Text style={styles.route}>{entry.route}</Text>
      </View>
      <View style={styles.rightColumn}>
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
        <Text style={styles.pay}>
          {formatCurrency(computeEffectiveDriverPay(entry))}
        </Text>
        <StatusBadge status={entry.paymentStatus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  leftColumn: {
    flex: 1,
  },
  date: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  route: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  rightColumn: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  attendance: {
    ...typography.label,
  },
  presentText: {
    color: colors.success,
  },
  absentText: {
    color: colors.disabled,
  },
  pay: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
