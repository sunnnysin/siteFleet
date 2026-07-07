import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { UpiAppOption } from '@/services/upiService';

type UpiPaymentModalStep = 'upiId' | 'appPicker';

interface UpiPaymentModalProps {
  visible: boolean;
  step: UpiPaymentModalStep;
  onClose: () => void;
  // upiId step
  driverName: string;
  upiIdValue: string;
  onChangeUpiId: (value: string) => void;
  upiIdErrorMessage?: string;
  isSavingUpiId: boolean;
  onSaveUpiId: () => void;
  // appPicker step
  isLoadingApps: boolean;
  appOptions: UpiAppOption[];
  onSelectApp: (option: UpiAppOption) => void;
}

export function UpiPaymentModal({
  visible,
  step,
  onClose,
  driverName,
  upiIdValue,
  onChangeUpiId,
  upiIdErrorMessage,
  isSavingUpiId,
  onSaveUpiId,
  isLoadingApps,
  appOptions,
  onSelectApp,
}: UpiPaymentModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            {step === 'upiId' ? (
              <>
                <Text style={styles.title}>Add UPI ID</Text>
                <Text style={styles.subtitle}>
                  {driverName} doesn't have a UPI ID yet. Add one to continue
                  with the payment.
                </Text>

                <FormTextInput
                  label="UPI ID"
                  value={upiIdValue}
                  onChangeText={onChangeUpiId}
                  autoCapitalize="none"
                  placeholder="name@bank"
                  errorMessage={upiIdErrorMessage}
                />

                <PrimaryButton
                  label="Save"
                  onPress={onSaveUpiId}
                  isLoading={isSavingUpiId}
                />
              </>
            ) : (
              <>
                <Text style={styles.title}>Pay with</Text>

                {isLoadingApps ? (
                  <ActivityIndicator
                    style={styles.loading}
                    color={colors.primary}
                  />
                ) : appOptions.length === 0 ? (
                  <Text style={styles.empty}>
                    No UPI apps found on this device.
                  </Text>
                ) : (
                  <View>
                    {appOptions.map(option => (
                      <Pressable
                        key={option.app.id}
                        style={styles.optionRow}
                        onPress={() => onSelectApp(option)}
                      >
                        <Text style={styles.optionLabel}>
                          {option.app.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}

            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  loading: {
    marginVertical: spacing.lg,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
    marginVertical: spacing.lg,
    textAlign: 'center',
  },
  optionRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  cancelButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelLabel: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
  },
});
