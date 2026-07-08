import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateNavigator } from '@/components/DateNavigator';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { saveDriverAdvance } from '@/services/driverAdvanceService';
import { dismissKeyboardAndWait } from '@/utils/navigationUtils';
import { todayKey } from '@/utils/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { TransportStackParamList } from '@/navigation/types';

type AddDriverAdvanceScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'AddDriverAdvance'
>;

export function AddDriverAdvanceScreen({
  route,
  navigation,
}: AddDriverAdvanceScreenProps) {
  const driverId = route.params.driverId;
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [amountInput, setAmountInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave(): Promise<void> {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Enter a valid amount.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveDriverAdvance({ driverId, date: selectedDate, amount });
      await dismissKeyboardAndWait();
      navigation.goBack();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save advance.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dateNavigator}>
          <DateNavigator
            selectedDate={selectedDate}
            onChange={setSelectedDate}
          />
        </View>
        <FormTextInput
          label="Amount paid"
          value={amountInput}
          onChangeText={setAmountInput}
          keyboardType="decimal-pad"
          errorMessage={errorMessage ?? undefined}
        />
        <View style={styles.saveButton}>
          <PrimaryButton
            label="Save"
            onPress={() => void handleSave()}
            isLoading={isSaving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  dateNavigator: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
