import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormFieldSkeleton } from '@/components/FormFieldSkeleton';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { DateNavigator } from '@/components/DateNavigator';
import { Shimmer } from '@/components/Shimmer';
import {
  fetchFuelPriceForDate,
  fetchFuelPricesForMonth,
  setFuelPriceForDate,
} from '@/services/fuelPriceService';
import { formatCurrency } from '@/utils/currencyUtils';
import {
  currentMonthKey,
  formatDisplayDateWithWeekday,
  todayKey,
} from '@/utils/dateUtils';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
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
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.form}>
            <View style={styles.dateNavigator}>
              <DateNavigator
                selectedDate={selectedDate}
                onChange={setSelectedDate}
              />
            </View>
            <FormFieldSkeleton labelWidth="45%" />
            <Shimmer style={styles.saveButtonSkeleton} />
          </View>

          <Text style={styles.sectionTitle}>Price history</Text>
          <MonthNavigator
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />

          <View style={styles.cardContainer}>
            {Array.from({ length: 5 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.historyRow,
                  index === 4 && styles.historyRowLast,
                ]}
              >
                <Shimmer style={styles.historyDateSkeleton} />
                <Shimmer style={styles.historyPriceSkeleton} />
              </View>
            ))}
          </View>
        </ScrollView>
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
      <ScrollView contentContainerStyle={styles.list}>
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
          <View style={styles.cardContainer}>
            {monthPrices.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.historyRow,
                  index === monthPrices.length - 1 && styles.historyRowLast,
                ]}
                onPress={() => setSelectedDate(item.date)}
                activeOpacity={0.7}
              >
                <Text style={styles.historyDate}>
                  {formatDisplayDateWithWeekday(item.date)}
                </Text>
                <Text style={styles.historyPrice}>
                  {formatCurrency(item.pricePerLitre)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: spacing.lg,
  },
  saveButtonSkeleton: {
    height: 48,
    borderRadius: radii.md,
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
    paddingBottom: spacing.lg,
  },
  cardContainer: {
    marginHorizontal: spacing.lg,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
    borderRadius: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyRowLast: {
    borderBottomWidth: 0,
  },
  historyDate: {
    ...typography.body,
    color: colors.textPrimary,
  },
  historyPrice: {
    ...typography.body,
    color: colors.textSecondary,
  },
  historyDateSkeleton: {
    width: '45%',
    height: 15,
  },
  historyPriceSkeleton: {
    width: '25%',
    height: 15,
  },
});
