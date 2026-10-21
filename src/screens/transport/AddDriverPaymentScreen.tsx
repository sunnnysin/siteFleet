import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DayGrid } from '@/components/DayGrid';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fetchAllDailyEntriesForDriver } from '@/services/dailyEntryService';
import { fetchAllDriverAdvances } from '@/services/driverAdvanceService';
import { computeDriverBalance } from '@/services/driverBalanceService';
import {
  fetchAllDriverPayments,
  saveDriverPayment,
  updateDriverPayment,
} from '@/services/driverPaymentService';
import { fetchDriverById } from '@/services/driverService';
import { formatCurrency, roundToTwoDecimals } from '@/utils/currencyUtils';
import {
  currentMonthKey,
  formatDateKey,
  formatDisplayDateWithWeekday,
  parseMonthKey,
  todayKey,
} from '@/utils/dateUtils';
import { endOfMonth, format } from 'date-fns';
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

function resolveDefaultDate(monthKey: string): string {
  const today = todayKey();
  return today.startsWith(monthKey)
    ? today
    : formatDateKey(endOfMonth(parseMonthKey(monthKey)));
}

function parseSelectedYear(dateKey: string): number {
  return Number(dateKey.slice(0, 4));
}

function parseSelectedDay(dateKey: string): number {
  return Number(dateKey.slice(8, 10));
}

export function AddDriverPaymentScreen({
  route,
  navigation,
}: AddDriverPaymentScreenProps) {
  const { driverId, paymentId } = route.params;
  const isEditMode = paymentId !== undefined;
  const [driver, setDriver] = useState<Driver | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [advances, setAdvances] = useState<DriverAdvance[]>([]);
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [monthKey, setMonthKey] = useState(
    route.params.month ?? currentMonthKey(),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    resolveDefaultDate(route.params.month ?? currentMonthKey()),
  );
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
        const editedPayment = fetchedPayments.find(
          payment => payment.id === paymentId,
        );
        if (editedPayment !== undefined) {
          setMonthKey(editedPayment.month);
          setSelectedDate(editedPayment.date);
          setAmountInput(String(editedPayment.amount));
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load driver.',
        );
      } finally {
        setIsLoading(false);
      }
    }
    void loadData();
  }, [driverId, paymentId]);

  const editedPayment = payments.find(payment => payment.id === paymentId);
  const monthDate = parseMonthKey(monthKey);
  const balance =
    driver === null
      ? null
      : computeDriverBalance(
          monthKey,
          driver.dailyRate,
          entries,
          advances,
          payments.filter(payment => payment.id !== paymentId),
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
      if (editedPayment !== undefined) {
        await updateDriverPayment(editedPayment, {
          date: selectedDate,
          amount,
        });
      } else {
        await saveDriverPayment({ driverId, date: selectedDate, amount });
      }
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
        <Text style={styles.monthLabel}>{format(monthDate, 'MMMM yyyy')}</Text>
        <Text style={styles.dateLabel}>
          Payment date: {formatDisplayDateWithWeekday(selectedDate)}
        </Text>
        <View style={styles.calendarCard}>
          <DayGrid
            year={monthDate.getFullYear()}
            monthIndex={monthDate.getMonth()}
            selectedYear={parseSelectedYear(selectedDate)}
            selectedMonthIndex={monthDate.getMonth()}
            selectedDay={parseSelectedDay(selectedDate)}
            onSelectDay={day =>
              setSelectedDate(
                formatDateKey(
                  new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
                ),
              )
            }
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
            label={isEditMode ? 'Update payment' : 'Save payment'}
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
  monthLabel: {
    ...typography.heading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  dateLabel: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: spacing.sm,
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
