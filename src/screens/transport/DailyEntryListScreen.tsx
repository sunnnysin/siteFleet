import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DailyEntryRow } from '@/components/DailyEntryRow';
import { DateNavigator } from '@/components/DateNavigator';
import { EmptyState } from '@/components/EmptyState';
import {
  computeEffectiveDriverPay,
  computeEffectiveFuelCost,
  fetchDailyEntriesForDate,
  markDailyEntryPaid,
  saveDailyFuelEntry,
} from '@/services/dailyEntryService';
import { fetchFuelPriceForDate } from '@/services/fuelPriceService';
import { openUpiPayment } from '@/services/upiService';
import { fetchDriverById } from '@/services/driverService';
import { useTransportStore } from '@/stores/useTransportStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import type { DailyEntry, SettlementType } from '@/types/dailyEntry';

interface RowInputState {
  dailyRate: string;
  fuelLitres: string;
}

export function DailyEntryListScreen() {
  const selectedDate = useTransportStore(state => state.selectedDate);
  const setSelectedDate = useTransportStore(state => state.setSelectedDate);

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [rowInputs, setRowInputs] = useState<Record<string, RowInputState>>({});
  const [hasFuelPrice, setHasFuelPrice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rowErrorMessage, setRowErrorMessage] = useState<string | null>(null);
  const [settlingEntryId, setSettlingEntryId] = useState<string | null>(null);

  const loadData = useCallback(
    async (isPullToRefresh: boolean) => {
      if (isPullToRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);
      try {
        const [fetchedEntries, fuelPrice] = await Promise.all([
          fetchDailyEntriesForDate(selectedDate),
          fetchFuelPriceForDate(selectedDate),
        ]);
        setEntries(fetchedEntries);
        setHasFuelPrice(fuelPrice !== null);
        setRowInputs(
          Object.fromEntries(
            fetchedEntries.map(entry => [
              entry.driverId,
              {
                dailyRate: String(entry.dailyRate),
                fuelLitres: String(entry.fuelLitres),
              },
            ]),
          ),
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load daily entries.',
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedDate],
  );

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

  function handleRowInputChange(
    driverId: string,
    field: keyof RowInputState,
    value: string,
  ): void {
    setRowInputs(previous => ({
      ...previous,
      [driverId]: { ...previous[driverId], [field]: value } as RowInputState,
    }));
  }

  async function commitRow(entry: DailyEntry): Promise<void> {
    const rowInput = rowInputs[entry.driverId];
    if (rowInput === undefined) {
      return;
    }

    const dailyRate = Number(rowInput.dailyRate);
    const fuelLitres = Number(rowInput.fuelLitres);
    if (!Number.isFinite(dailyRate) || !Number.isFinite(fuelLitres)) {
      setRowErrorMessage('Daily rate and fuel litres must be numbers.');
      return;
    }

    setRowErrorMessage(null);
    try {
      const updatedEntry = await saveDailyFuelEntry(
        selectedDate,
        entry.driverId,
        {
          dailyRate,
          fuelLitres,
          settlementType: entry.settlementType,
        },
      );
      setEntries(previous =>
        previous.map(existing =>
          existing.id === updatedEntry.id ? updatedEntry : existing,
        ),
      );
    } catch (error) {
      setRowErrorMessage(
        error instanceof Error ? error.message : 'Failed to save entry.',
      );
    }
  }

  async function handleToggleSameDay(entry: DailyEntry): Promise<void> {
    const nextSettlementType: SettlementType =
      entry.settlementType === 'sameDay' ? 'monthly' : 'sameDay';
    try {
      const updatedEntry = await saveDailyFuelEntry(
        selectedDate,
        entry.driverId,
        {
          dailyRate: entry.dailyRate,
          fuelLitres: entry.fuelLitres,
          settlementType: nextSettlementType,
        },
      );
      setEntries(previous =>
        previous.map(existing =>
          existing.id === updatedEntry.id ? updatedEntry : existing,
        ),
      );
    } catch (error) {
      setRowErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update settlement type.',
      );
    }
  }

  async function handleSettleNow(entry: DailyEntry): Promise<void> {
    setSettlingEntryId(entry.id);
    setRowErrorMessage(null);
    try {
      const driver = await fetchDriverById(entry.driverId);
      if (driver === null) {
        throw new Error('Driver not found.');
      }
      await openUpiPayment(
        driver.upiId,
        driver.name,
        computeEffectiveDriverPay(entry),
      );
      const paidEntry = await markDailyEntryPaid(entry);
      setEntries(previous =>
        previous.map(existing =>
          existing.id === paidEntry.id ? paidEntry : existing,
        ),
      );
    } catch (error) {
      setRowErrorMessage(
        error instanceof Error ? error.message : 'Failed to open UPI payment.',
      );
    } finally {
      setSettlingEntryId(null);
    }
  }

  const totalFuelCost = entries.reduce(
    (sum, entry) => sum + computeEffectiveFuelCost(entry),
    0,
  );
  const totalDriverPayout = entries.reduce(
    (sum, entry) => sum + computeEffectiveDriverPay(entry),
    0,
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />

      {isLoading ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.primary}
        />
      ) : errorMessage !== null ? (
        <EmptyState
          title="Couldn't load entries"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData(false)}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No entries yet"
          message="Create a daily assignment for this date first."
        />
      ) : !hasFuelPrice ? (
        <EmptyState
          title="Fuel price not set"
          message="Set today's fuel price before logging fuel entries."
        />
      ) : (
        <>
          <View style={styles.summaryBar}>
            <Text style={styles.summaryText}>Vehicles: {entries.length}</Text>
            <Text style={styles.summaryText}>
              Fuel: {formatCurrency(totalFuelCost)}
            </Text>
            <Text style={styles.summaryText}>
              Payout: {formatCurrency(totalDriverPayout)}
            </Text>
          </View>
          {rowErrorMessage !== null ? (
            <Text style={styles.rowError}>{rowErrorMessage}</Text>
          ) : null}
          <FlatList
            data={entries}
            keyExtractor={entry => entry.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => void loadData(true)}
              />
            }
            renderItem={({ item }) => (
              <DailyEntryRow
                entry={item}
                dailyRateInput={rowInputs[item.driverId]?.dailyRate ?? '0'}
                fuelLitresInput={rowInputs[item.driverId]?.fuelLitres ?? '0'}
                onChangeDailyRate={value =>
                  handleRowInputChange(item.driverId, 'dailyRate', value)
                }
                onChangeFuelLitres={value =>
                  handleRowInputChange(item.driverId, 'fuelLitres', value)
                }
                onCommit={() => void commitRow(item)}
                onToggleSameDay={() => void handleToggleSameDay(item)}
                onSettleNow={() => void handleSettleNow(item)}
                isSettling={settlingEntryId === item.id}
              />
            )}
          />
        </>
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
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  summaryText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  rowError: {
    ...typography.caption,
    color: colors.danger,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
});
