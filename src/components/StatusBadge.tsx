import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { PaymentStatus } from '@/types/dailyEntry';

interface StatusBadgeProps {
  status: PaymentStatus;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <View
      style={[styles.badge, status === 'paid' ? styles.paid : styles.unpaid]}
    >
      <Text style={styles.label}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    alignSelf: 'flex-start',
  },
  paid: {
    backgroundColor: colors.success,
  },
  unpaid: {
    backgroundColor: colors.warning,
  },
  label: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
});
