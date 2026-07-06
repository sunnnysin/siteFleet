import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import type { MonthlyPayment } from '@/types/payment';

interface MonthlyPaymentRowProps {
  payment: MonthlyPayment;
  onPay: () => void;
  onMarkPaid: () => void;
  isProcessing: boolean;
}

export function MonthlyPaymentRow({
  payment,
  onPay,
  onMarkPaid,
  isProcessing,
}: MonthlyPaymentRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.driverName}>{payment.driverName}</Text>
        <StatusBadge status={payment.paymentStatus} />
      </View>
      <Text style={styles.meta}>Days present: {payment.daysPresent}</Text>
      <Text style={styles.meta}>
        Settled same-day: {formatCurrency(payment.amountSettledSameDay)}
      </Text>
      <Text style={styles.amountDue}>
        Amount due: {formatCurrency(payment.amountDue)}
      </Text>

      {payment.paymentStatus === 'unpaid' ? (
        <View style={styles.actions}>
          <PrimaryButton
            label="Pay via UPI"
            onPress={onPay}
            isLoading={isProcessing}
          />
          <View style={styles.markPaidButton}>
            <PrimaryButton
              label="Mark as paid"
              onPress={onMarkPaid}
              variant="secondary"
              isLoading={isProcessing}
            />
          </View>
        </View>
      ) : null}
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
  amountDue: {
    ...typography.subheading,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  markPaidButton: {
    marginTop: spacing.xs,
  },
});
