import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface NavigationTileProps {
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

export function NavigationTile({
  label,
  onPress,
  isLast = false,
}: NavigationTileProps) {
  return (
    <TouchableOpacity
      style={[styles.tile, isLast && styles.tileLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tileLast: {
    borderBottomWidth: 0,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
