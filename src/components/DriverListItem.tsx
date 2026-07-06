import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Driver } from '@/types/driver';

interface DriverListItemProps {
  driver: Driver;
  onPress: () => void;
  onToggleActive: () => void;
}

export function DriverListItem({
  driver,
  onPress,
  onToggleActive,
}: DriverListItemProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      onLongPress={onToggleActive}
    >
      <View style={styles.details}>
        <Text style={styles.name}>{driver.name}</Text>
        <Text style={styles.meta}>
          {driver.phone} · {driver.upiId}
        </Text>
      </View>
      <View
        style={[
          styles.statusDot,
          driver.isActive ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    </Pressable>
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
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    marginLeft: spacing.md,
  },
  activeDot: {
    backgroundColor: colors.success,
  },
  inactiveDot: {
    backgroundColor: colors.disabled,
  },
});
