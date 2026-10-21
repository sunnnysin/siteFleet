import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import deleteIcon from '@/assets/delete.png';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDisplayDateWithWeekday } from '@/utils/dateUtils';
import type { DriverPayment } from '@/types/driverPayment';

interface DriverPaymentRowProps {
  payment: DriverPayment;
  onDelete: () => void;
  isDeleting: boolean;
  isLast?: boolean;
}

export function DriverPaymentRow({
  payment,
  onDelete,
  isDeleting,
  isLast = false,
}: DriverPaymentRowProps) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Text style={styles.date}>
        {formatDisplayDateWithWeekday(payment.date)}
      </Text>
      <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
      <TouchableOpacity
        onPress={onDelete}
        disabled={isDeleting}
        hitSlop={8}
        activeOpacity={0.7}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={colors.danger} />
        ) : (
          <Image
            source={deleteIcon}
            style={styles.deleteIcon}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
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
  date: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  amount: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  deleteIcon: {
    width: 22,
    height: 22,
  },
});
