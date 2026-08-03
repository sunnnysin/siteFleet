import { StyleSheet, View } from 'react-native';
import { Shimmer } from '@/components/Shimmer';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface DriverHistoryRowSkeletonProps {
  isLast?: boolean;
}

export function DriverHistoryRowSkeleton({
  isLast = false,
}: DriverHistoryRowSkeletonProps) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.dateColumn}>
        <Shimmer style={styles.date} />
        <Shimmer style={styles.route} />
      </View>
      <Shimmer style={styles.attendance} />
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
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dateColumn: {
    flex: 1.4,
  },
  date: {
    width: '70%',
    height: 13,
  },
  route: {
    width: '50%',
    height: 13,
    marginTop: spacing.xs / 2,
  },
  attendance: {
    width: 50,
    height: 13,
  },
});
