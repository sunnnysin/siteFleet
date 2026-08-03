import { StyleSheet, View } from 'react-native';
import { Shimmer } from '@/components/Shimmer';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

export function DailyEntryRowSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Shimmer style={styles.route} />
        <Shimmer style={styles.badge} />
      </View>
      <Shimmer style={styles.driverName} />
      <Shimmer style={styles.meta} />
      <Shimmer style={styles.attendance} />
      <View style={styles.figuresRow}>
        <Shimmer style={styles.figure} />
        <Shimmer style={styles.figure} />
      </View>
      <Shimmer style={styles.footer} />
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
  route: {
    width: '35%',
    height: 18,
  },
  badge: {
    width: 60,
    height: 18,
    borderRadius: radii.pill,
  },
  driverName: {
    width: '45%',
    height: 15,
    marginTop: spacing.xs,
  },
  meta: {
    width: '30%',
    height: 13,
    marginTop: spacing.xs / 2,
  },
  attendance: {
    width: 60,
    height: 13,
    marginTop: spacing.xs,
  },
  figuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  figure: {
    width: '40%',
    height: 13,
  },
  footer: {
    width: '25%',
    height: 13,
    marginTop: spacing.sm,
  },
});
