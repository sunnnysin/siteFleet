import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: 'filled' | 'secondary' | 'danger';
}

export function PrimaryButton({
  label,
  onPress,
  isLoading = false,
  isDisabled = false,
  variant = 'filled',
}: PrimaryButtonProps) {
  const isInteractionBlocked = isLoading || isDisabled;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isInteractionBlocked}
      style={[
        styles.button,
        variant === 'danger'
          ? styles.dangerButton
          : variant === 'secondary'
          ? styles.secondaryButton
          : styles.filledButton,
        isInteractionBlocked ? styles.disabledButton : null,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.textPrimary : colors.surface}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'secondary' ? styles.secondaryLabel : null,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  label: {
    ...typography.subheading,
    color: colors.surface,
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
});
