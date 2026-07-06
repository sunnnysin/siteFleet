import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import type { DailyEntry } from '@/types/dailyEntry';

interface DailyEntryRowProps {
  entry: DailyEntry;
  dailyRateInput: string;
  fuelLitresInput: string;
  onChangeDailyRate: (value: string) => void;
  onChangeFuelLitres: (value: string) => void;
  onCommit: () => void;
  onToggleSameDay: () => void;
  onSettleNow: () => void;
  isSettling: boolean;
}

export function DailyEntryRow({
  entry,
  dailyRateInput,
  fuelLitresInput,
  onChangeDailyRate,
  onChangeFuelLitres,
  onCommit,
  onToggleSameDay,
  onSettleNow,
  isSettling,
}: DailyEntryRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.driverName}>{entry.driverName}</Text>
        <StatusBadge status={entry.paymentStatus} />
      </View>
      <Text style={styles.meta}>
        {entry.vehicleType} · {entry.vehicleNumber} · {entry.route}
      </Text>
      <Text style={styles.meta}>
        {entry.attendance === 'present' ? 'Present' : 'Absent'}
      </Text>

      <View style={styles.fieldsRow}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Daily rate</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={dailyRateInput}
            onChangeText={onChangeDailyRate}
            onEndEditing={onCommit}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Fuel litres</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={fuelLitresInput}
            onChangeText={onChangeFuelLitres}
            onEndEditing={onCommit}
          />
        </View>
      </View>

      <Text style={styles.computed}>
        Fuel cost: {formatCurrency(entry.fuelCost)}
      </Text>

      <View style={styles.footerRow}>
        <Pressable onPress={onToggleSameDay}>
          <Text style={styles.settlementLabel}>
            {entry.settlementType === 'sameDay' ? 'Same-day' : 'Monthly'}
          </Text>
        </Pressable>
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
    </View>
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
  driverName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  computed: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
