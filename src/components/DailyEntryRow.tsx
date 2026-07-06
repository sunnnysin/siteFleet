import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import {
  computeEffectiveDriverPay,
  computeEffectiveFuelCost,
} from '@/services/dailyEntryService';
import type { DailyEntry } from '@/types/dailyEntry';

interface DailyEntryRowProps {
  entry: DailyEntry;
  onPress: () => void;
  onSettleNow: () => void;
  isSettling: boolean;
}

export function DailyEntryRow({
  entry,
  onPress,
  onSettleNow,
  isSettling,
}: DailyEntryRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.route}>{entry.route}</Text>
        <StatusBadge status={entry.paymentStatus} />
      </View>
      <Text style={styles.driverName}>{entry.driverName}</Text>
      <Text style={styles.meta}>
        {entry.vehicleType} · {entry.vehicleNumber}
      </Text>
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

      <View style={styles.figuresRow}>
        <Text style={styles.figure}>
          Fuel: {entry.fuelLitres} L (
          {formatCurrency(computeEffectiveFuelCost(entry))})
        </Text>
        <Text style={styles.figure}>
          Pay: {formatCurrency(computeEffectiveDriverPay(entry))}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.settlementLabel}>
          {entry.settlementType === 'sameDay' ? 'Same-day' : 'Monthly'}
        </Text>
        {entry.settlementType === 'sameDay' &&
        entry.paymentStatus === 'unpaid' ? (
          <Pressable
            style={styles.settleButton}
            onPress={onSettleNow}
            disabled={isSettling}
          >
            <Text style={styles.settleLabel}>
              {isSettling ? 'Opening UPI…' : 'Settle now'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  route: {
    ...typography.subheading,
    color: colors.primary,
  },
  driverName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  attendance: {
    ...typography.label,
    marginTop: spacing.xs,
  },
  presentText: {
    color: colors.success,
  },
  absentText: {
    color: colors.disabled,
  },
  figuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  figure: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  settlementLabel: {
    ...typography.label,
    color: colors.primary,
  },
  settleButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  settleLabel: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
});
