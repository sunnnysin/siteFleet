import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateNavigator } from '@/components/DateNavigator';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fetchAllDailyEntriesForDriver } from '@/services/dailyEntryService';
import { fetchAllDriverAdvances } from '@/services/driverAdvanceService';
import { computeDriverBalance } from '@/services/driverBalanceService';
import {
  fetchAllDriverPayments,
  saveDriverPayment,
} from '@/services/driverPaymentService';
import { fetchDriverById } from '@/services/driverService';
import { formatCurrency, roundToTwoDecimals } from '@/utils/currencyUtils';
import { formatMonthKey, parseDateKey, todayKey } from '@/utils/dateUtils';
import { dismissKeyboardAndWait } from '@/utils/navigationUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { TransportStackParamList } from '@/navigation/types';
import type { Driver } from '@/types/driver';
import type { DailyEntry } from '@/types/dailyEntry';
import type { DriverAdvance } from '@/types/driverAdvance';
import type { DriverPayment } from '@/types/driverPayment';

type AddDriverPaymentScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'AddDriverPayment'
>;

export function AddDriverPaymentScreen({
  route,
  navigation,
}: AddDriverPaymentScreenProps) {
  const driverId = route.params.driverId;
  const [driver, setDriver] = useState<Driver | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [advances, setAdvances] = useState<DriverAdvance[]>([]);
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [amountInput, setAmountInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const [
          fetchedDriver,
          fetchedEntries,
          fetchedAdvances,
          fetchedPayments,
        ] = await Promise.all([
          fetchDriverById(driverId),
          fetchAllDailyEntriesForDriver(driverId),
          fetchAllDriverAdvances(driverId),
          fetchAllDriverPayments(driverId),
        ]);
        setDriver(fetchedDriver);
        setEntries(fetchedEntries);
        setAdvances(fetchedAdvances);
        setPayments(fetchedPayments);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load driver.',
        );
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, [driverId]);

  const monthKey = formatMonthKey(parseDateKey(selectedDate));
  const balance =
    driver === null
      ? null
      : computeDriverBalance(
          monthKey,
          driver.dailyRate,
          entries,
          advances,
          payments,
        );

  async function handleSave(): Promise<void> {
    const amount = roundToTwoDecimals(Number(amountInput));
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Enter a valid amount.');
      return;
    }
    if (balance === null) {
      return;
    }
    if (amount > balance.remaining) {
      setErrorMessage(
        balance.remaining > 0
          ? `Amount exceeds the remaining ${formatCurrency(balance.remaining)}.`
          : 'Nothing is remaining to pay for this month.',
      );
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveDriverPayment({ driverId, date: selectedDate, amount });
      await dismissKeyboardAndWait();
      navigation.goBack();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save payment.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.dateNavigator}>
          <DateNavigator
            selectedDate={selectedDate}
            onChange={setSelectedDate}
          />
        </View>
        {driver !== null ? (
          <Text style={styles.driverName}>{driver.name}</Text>
        ) : null}
        {balance !== null ? (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Remaining to pay</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(Math.max(balance.remaining, 0))}
            </Text>
            {balance.carriedForward !== 0 ? (
              <Text style={styles.balanceHint}>
                Includes {formatCurrency(Math.abs(balance.carriedForward))}{' '}
                {balance.carriedForward > 0
                  ? 'carried forward from earlier months'
                  : 'excess paid in earlier months'}
              </Text>
            ) : null}
          </View>
        ) : null}
        <FormTextInput
          label="Amount paid"
          value={amountInput}
          onChangeText={setAmountInput}
          keyboardType="decimal-pad"
          errorMessage={errorMessage ?? undefined}
        />
        <View style={styles.saveButton}>
          <PrimaryButton
            label="Save payment"
            onPress={() => void handleSave()}
            isLoading={isSaving}
            isDisabled={isLoading || driver === null}
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
  driverName: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
  },
  balanceLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  balanceValue: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginTop: spacing.xs / 2,
  },
  balanceHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
