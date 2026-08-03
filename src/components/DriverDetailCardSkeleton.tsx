import { StyleSheet, View } from 'react-native';
import { Shimmer } from '@/components/Shimmer';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

const DETAIL_ROW_COUNT = 7;

export function DriverDetailCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Shimmer style={styles.name} />
          <Shimmer style={styles.driverType} />
        </View>
        <Shimmer style={styles.activeDot} />
      </View>

      <View style={styles.divider} />

      {Array.from({ length: DETAIL_ROW_COUNT }, (_, index) => (
        <View key={index} style={styles.row}>
          <Shimmer style={styles.rowLabel} />
          <Shimmer style={styles.rowValue} />
        </View>
      ))}

      <View style={styles.footer}>
        <Shimmer style={styles.editButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  name: {
    width: '45%',
    height: 18,
  },
  driverType: {
    width: '25%',
    height: 13,
    marginTop: spacing.xs,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    width: '30%',
    height: 13,
  },
  rowValue: {
    width: '40%',
    height: 15,
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
  editButton: {
    width: 56,
    height: 28,
    borderRadius: radii.sm,
  },
});
