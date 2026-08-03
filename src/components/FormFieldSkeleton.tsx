import { StyleSheet, View } from 'react-native';
import { Shimmer } from '@/components/Shimmer';
import { radii, spacing } from '@/theme/spacing';

interface FormFieldSkeletonProps {
  labelWidth?: `${number}%`;
}

export function FormFieldSkeleton({
  labelWidth = '35%',
}: FormFieldSkeletonProps) {
  return (
    <View style={styles.container}>
      <Shimmer style={[styles.label, { width: labelWidth }]} />
      <Shimmer style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    height: 13,
    marginBottom: spacing.xs,
  },
  input: {
    height: 40,
    borderRadius: radii.sm,
  },
});
