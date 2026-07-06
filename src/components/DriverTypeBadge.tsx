import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DriverType } from '@/types/driver';

interface DriverTypeBadgeProps {
  driverType: DriverType;
}

const DRIVER_TYPE_LABELS: Record<DriverType, string> = {
  permanent: 'Permanent',
  replacement: 'Replacement',
};

export function DriverTypeBadge({ driverType }: DriverTypeBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        driverType === 'permanent' ? styles.permanent : styles.replacement,
      ]}
    >
      <Text
        style={[
          styles.label,
          driverType === 'permanent'
            ? styles.permanentLabel
            : styles.replacementLabel,
        ]}
      >
        {DRIVER_TYPE_LABELS[driverType]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  permanent: {
    backgroundColor: `${colors.success}1A`,
    borderColor: `${colors.success}40`,
  },
  replacement: {
    backgroundColor: `${colors.danger}1A`,
    borderColor: `${colors.danger}40`,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
  permanentLabel: {
    color: colors.success,
  },
  replacementLabel: {
    color: colors.danger,
  },
});
