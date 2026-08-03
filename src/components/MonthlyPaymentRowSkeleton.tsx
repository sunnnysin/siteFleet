import { StyleSheet, View } from 'react-native';
import { Shimmer } from '@/components/Shimmer';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

export function MonthlyPaymentRowSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Shimmer style={styles.driverName} />
        <Shimmer style={styles.statusBadge} />
      </View>
      <Shimmer style={styles.meta} />
      <Shimmer style={styles.amountDue} />
      <View style={styles.actions}>
        <Shimmer style={styles.actionButton} />
        <Shimmer style={styles.actionButton} />
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
    width: '40%',
    height: 15,
  },
  statusBadge: {
    width: 60,
    height: 18,
    borderRadius: radii.pill,
  },
  meta: {
    width: '50%',
    height: 13,
    marginTop: spacing.xs,
  },
  amountDue: {
    width: '35%',
    height: 18,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: radii.md,
  },
});
