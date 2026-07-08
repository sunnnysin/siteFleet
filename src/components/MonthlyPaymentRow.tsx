import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DriverTypeBadge } from '@/components/DriverTypeBadge';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import type { DriverType } from '@/types/driver';
import type { MonthlyPayment } from '@/types/payment';

interface MonthlyPaymentRowProps {
  payment: MonthlyPayment;
  driverType: DriverType | null;
  onPress: () => void;
  onPay: () => void;
  onMarkPaid: () => void;
  onMarkUnpaid: () => void;
  isProcessing: boolean;
}

export function MonthlyPaymentRow({
  payment,
  driverType,
  onPress,
  onPay,
  onMarkPaid,
  onMarkUnpaid,
  isProcessing,
}: MonthlyPaymentRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.driverName}>{payment.driverName}</Text>
          {driverType === 'temporary' ? (
            <DriverTypeBadge driverType="temporary" />
          ) : null}
        </View>
        <StatusBadge status={payment.paymentStatus} />
      </View>
      <Text style={styles.meta}>Days present: {payment.daysPresent}</Text>
      {payment.amountSettledSameDay > 0 ? (
        <Text style={styles.meta}>
          Settled same-day: {formatCurrency(payment.amountSettledSameDay)}
        </Text>
      ) : null}
      <Text style={styles.amountDue}>
        Amount due: {formatCurrency(payment.amountDue)}
      </Text>

      {payment.paymentStatus === 'unpaid' ? (
        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Pay via UPI"
              onPress={onPay}
              isLoading={isProcessing}
              size="small"
            />
          </View>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Mark as paid"
              onPress={onMarkPaid}
              variant="secondary"
              isLoading={isProcessing}
              size="small"
            />
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.markUnpaidButton}
          onPress={onMarkUnpaid}
          disabled={isProcessing}
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Text style={styles.markUnpaidLabel}>Mark as unpaid</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
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
  amountDue: {
    ...typography.subheading,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  markUnpaidButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  markUnpaidLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
