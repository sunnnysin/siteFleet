import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Route } from '@/types/route';

interface RouteListItemProps {
  route: Route;
  onPress: () => void;
}

export function RouteListItem({ route, onPress }: RouteListItemProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View>
        <Text style={styles.name}>{route.name}</Text>
        <Text style={styles.description}>{route.description}</Text>
        <Text style={styles.fuel}>Fuel: {route.fuelLitres ?? 0} L / trip</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  fuel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
});
