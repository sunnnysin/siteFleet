import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface NavigationTileProps {
  label: string;
  onPress: () => void;
}

export function NavigationTile({ label, onPress }: NavigationTileProps) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
