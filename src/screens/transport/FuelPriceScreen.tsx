import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { DateNavigator } from '@/components/DateNavigator';
import {
  fetchFuelPriceForDate,
  fetchFuelPricesForMonth,
  setFuelPriceForDate,
} from '@/services/fuelPriceService';
import { formatCurrency } from '@/utils/currencyUtils';
import {
  currentMonthKey,
  formatDisplayDate,
  todayKey,
} from '@/utils/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { FuelPrice } from '@/types/fuelPrice';

export function FuelPriceScreen() {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [priceInput, setPriceInput] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [monthPrices, setMonthPrices] = useState<FuelPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [priceForDate, prices] = await Promise.all([
        fetchFuelPriceForDate(selectedDate),
        fetchFuelPricesForMonth(selectedMonth),
      ]);
      setPriceInput(
        priceForDate !== null ? String(priceForDate.pricePerLitre) : '',
      );
      setMonthPrices(prices);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load fuel prices.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSave(): Promise<void> {
    const pricePerLitre = Number(priceInput);
    if (!Number.isFinite(pricePerLitre) || pricePerLitre <= 0) {
      setSaveErrorMessage('Enter a valid price per litre.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await setFuelPriceForDate({ date: selectedDate, pricePerLitre });
      await loadData();
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save fuel price.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.primary}
        />
      </SafeAreaView>
    );
  }

  if (errorMessage !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Couldn't load fuel prices"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.form}>
        <View style={styles.dateNavigator}>
          <DateNavigator
            selectedDate={selectedDate}
            onChange={setSelectedDate}
          />
        </View>
        <FormTextInput
          label="Price per litre"
          value={priceInput}
          onChangeText={setPriceInput}
          keyboardType="decimal-pad"
          errorMessage={saveErrorMessage ?? undefined}
        />
        <PrimaryButton
          label="Save"
          onPress={() => void handleSave()}
          isLoading={isSaving}
        />
      </View>

      <Text style={styles.sectionTitle}>Price history</Text>
      <MonthNavigator
        selectedMonth={selectedMonth}
        onChange={setSelectedMonth}
      />

      {monthPrices.length === 0 ? (
        <EmptyState
          title="No history yet"
          message="Fuel prices you set this month will appear here."
        />
      ) : (
        <FlatList
          data={monthPrices}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.historyRow}
              onPress={() => setSelectedDate(item.date)}
            >
              <Text style={styles.historyDate}>
                {formatDisplayDate(item.date)}
              </Text>
              <Text style={styles.historyPrice}>
                {formatCurrency(item.pricePerLitre)}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingIndicator: {
    marginTop: spacing.xl,
  },
  form: {
    padding: spacing.lg,
  },
  dateNavigator: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: {
    ...typography.body,
    color: colors.textPrimary,
  },
  historyPrice: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
