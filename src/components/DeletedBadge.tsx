import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function DeletedBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>Deleted</Text>
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
    backgroundColor: `${colors.textSecondary}1A`,
    borderColor: `${colors.textSecondary}40`,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
