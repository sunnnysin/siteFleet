import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { GoogleLogo } from '@/components/GoogleLogo';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export function GoogleSignInButton({
  onPress,
  isLoading = false,
}: GoogleSignInButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isLoading}
      style={[styles.button, isLoading ? styles.disabledButton : null]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <>
          <GoogleLogo />
          <Text style={styles.label}>Sign in with Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  label: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
});
