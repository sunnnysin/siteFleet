import { StyleSheet, View } from 'react-native';
import { Shimmer } from '@/components/Shimmer';
import { radii, spacing } from '@/theme/spacing';

export function SummaryCardSkeleton() {
  return (
    <View style={styles.card}>
      <Shimmer style={styles.value} />
      <Shimmer style={styles.label} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: radii.md,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
  },
  value: {
    width: '55%',
    height: 20,
  },
  label: {
    width: '75%',
    height: 13,
    marginTop: spacing.xs,
  },
});
