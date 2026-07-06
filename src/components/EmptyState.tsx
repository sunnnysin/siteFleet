import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface EmptyStateProps {
  title: string;
  message: string;
  variant?: 'empty' | 'error';
  retryLabel?: string;
  onRetry?: () => void;
}

export function EmptyState({
  title,
  message,
  variant = 'empty',
  retryLabel = 'Retry',
  onRetry,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, variant === 'error' ? styles.errorTitle : null]}
      >
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry !== undefined ? (
        <View style={styles.retryButton}>
          <PrimaryButton label={retryLabel} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorTitle: {
    color: colors.danger,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
});
