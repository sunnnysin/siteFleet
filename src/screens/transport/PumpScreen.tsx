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
import { format, parse } from 'date-fns';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { DateNavigator } from '@/components/DateNavigator';
import { fetchFuelPriceForDate } from '@/services/fuelPriceService';
import { fetchDailyEntriesForDate } from '@/services/dailyEntryService';
import {
  computePumpEntriesTotals,
  fetchPumpEntriesForMonth,
  fetchPumpEntryForDate,
  savePumpEntryForDate,
} from '@/services/pumpEntryService';
import { sharePumpMonthlyReport } from '@/services/pumpReportService';
import { formatCurrency } from '@/utils/currencyUtils';
import {
  currentMonthKey,
  formatDisplayDate,
  MONTH_FORMAT,
  todayKey,
} from '@/utils/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { FuelPrice } from '@/types/fuelPrice';
import type { PumpEntry } from '@/types/pumpEntry';

export function PumpScreen() {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [litresInput, setLitresInput] = useState('');
  const [driverFuelTotal, setDriverFuelTotal] = useState(0);
  const [priceForDate, setPriceForDate] = useState<FuelPrice | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [monthEntries, setMonthEntries] = useState<PumpEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [price, existingEntry, entries, dailyEntries] = await Promise.all([
        fetchFuelPriceForDate(selectedDate),
        fetchPumpEntryForDate(selectedDate),
        fetchPumpEntriesForMonth(selectedMonth),
        fetchDailyEntriesForDate(selectedDate),
      ]);
      const totalDriverFuel = dailyEntries.reduce(
        (sum, entry) =>
          sum + (entry.attendance === 'present' ? entry.fuelLitres : 0),
        0,
      );
      setPriceForDate(price);
      setDriverFuelTotal(totalDriverFuel);
      setLitresInput(
        existingEntry !== null
          ? String(existingEntry.litres)
          : totalDriverFuel > 0
          ? String(totalDriverFuel)
          : '',
      );
      setMonthEntries(entries);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load pump data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedMonth]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSave(): Promise<void> {
    const litres = Number(litresInput);
    if (!Number.isFinite(litres) || litres <= 0) {
      setSaveErrorMessage('Enter a valid litres amount.');
      return;
    }
    if (priceForDate === null) {
      setSaveErrorMessage('Set fuel price for this date first.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await savePumpEntryForDate({ date: selectedDate, litres });
      await loadData();
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save pump entry.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExport(): Promise<void> {
    setIsExporting(true);
    setExportErrorMessage(null);
    try {
      const monthLabel = format(
        parse(selectedMonth, MONTH_FORMAT, new Date()),
        'MMMM yyyy',
      );
      await sharePumpMonthlyReport(monthLabel, monthEntries);
    } catch (error) {
      setExportErrorMessage(
        error instanceof Error ? error.message : 'Failed to export report.',
      );
    } finally {
      setIsExporting(false);
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
          title="Couldn't load pump data"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  const estimatedCost =
    priceForDate !== null && Number.isFinite(Number(litresInput))
      ? Number(litresInput) * priceForDate.pricePerLitre
      : null;

  const totals = computePumpEntriesTotals(monthEntries);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={monthEntries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.form}>
              <View style={styles.dateNavigator}>
                <DateNavigator
                  selectedDate={selectedDate}
                  onChange={setSelectedDate}
                />
              </View>
              <FormTextInput
                label="Fuel taken (litres)"
                value={litresInput}
                onChangeText={setLitresInput}
                keyboardType="decimal-pad"
                errorMessage={saveErrorMessage ?? undefined}
              />
              {driverFuelTotal > 0 ? (
                <Text style={styles.driverFuelHint}>
                  From daily entries: {driverFuelTotal} L (editable)
                </Text>
              ) : null}
              {priceForDate !== null ? (
                <Text style={styles.priceHint}>
                  Price for this date:{' '}
                  {formatCurrency(priceForDate.pricePerLitre)}
                  /L
                  {estimatedCost !== null
                    ? ` · Estimated cost: ${formatCurrency(estimatedCost)}`
                    : ''}
                </Text>
              ) : (
                <Text style={styles.priceWarning}>
                  No fuel price set for this date. Set it in Fuel Price first.
                </Text>
              )}
              <PrimaryButton
                label="Save"
                onPress={() => void handleSave()}
                isLoading={isSaving}
              />
            </View>

            <Text style={styles.sectionTitle}>Month-wise history</Text>
            <View style={styles.monthNavigator}>
              <MonthNavigator
                selectedMonth={selectedMonth}
                onChange={setSelectedMonth}
              />
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Total: {totals.totalLitres} L
              </Text>
              <Text style={styles.totalsLabel}>
                {formatCurrency(totals.totalCost)}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No history yet"
            message="Pump entries you log this month will appear here."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.historyRow}
            onPress={() => setSelectedDate(item.date)}
          >
            <Text style={styles.historyDate}>
              {formatDisplayDate(item.date)}
            </Text>
            <Text style={styles.historyLitres}>{item.litres} L</Text>
            <Text style={styles.historyPrice}>
              {formatCurrency(item.pricePerLitre)}
            </Text>
            <Text style={styles.historyCost}>
              {formatCurrency(item.totalCost)}
            </Text>
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        {exportErrorMessage !== null ? (
          <Text style={styles.exportError}>{exportErrorMessage}</Text>
        ) : null}
        <PrimaryButton
          label="Download report"
          onPress={() => void handleExport()}
          variant="secondary"
          isLoading={isExporting}
        />
      </View>
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
    paddingVertical: spacing.lg,
  },
  dateNavigator: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  monthNavigator: {
    marginHorizontal: -spacing.lg,
  },
  driverFuelHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.xs,
  },
  priceHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  priceWarning: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  totalsLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
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
    flex: 1,
  },
  historyLitres: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  historyPrice: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  historyCost: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  exportError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
