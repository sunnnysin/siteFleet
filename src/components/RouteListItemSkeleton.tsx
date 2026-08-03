import { StyleSheet, View } from 'react-native';
import { Shimmer } from '@/components/Shimmer';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

export function RouteListItemSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.details}>
        <Shimmer style={styles.name} />
        <Shimmer style={styles.meta} />
      </View>
      <Shimmer style={styles.deleteIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  details: {
    flex: 1,
  },
  name: {
    width: '45%',
    height: 15,
  },
  meta: {
    width: '65%',
    height: 13,
    marginTop: spacing.xs,
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    marginLeft: spacing.md,
  },
});
