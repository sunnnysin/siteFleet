import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DailyEntryRow } from '@/components/DailyEntryRow';
import { DailyEntryRowSkeleton } from '@/components/DailyEntryRowSkeleton';
import { DateNavigator } from '@/components/DateNavigator';
import { EmptyState } from '@/components/EmptyState';
import {
  computeEffectiveDriverPay,
  computeEffectiveFuelCost,
  deleteDailyEntry,
  fetchDailyEntriesForDate,
  markDailyEntryPaid,
} from '@/services/dailyEntryService';
import { fetchFuelPriceForDate } from '@/services/fuelPriceService';
import { openUpiPayment } from '@/services/upiService';
import { fetchDriverById } from '@/services/driverService';
import { useTransportStore } from '@/stores/useTransportStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import type { TransportStackParamList } from '@/navigation/types';
import type { DailyEntry } from '@/types/dailyEntry';

type DailyEntryListScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'DailyEntryList'
>;

function sortByRoute(entries: DailyEntry[]): DailyEntry[] {
  return [...entries].sort((first, second) => {
    const routeComparison = first.route.localeCompare(second.route, undefined, {
      numeric: true,
    });
    return routeComparison !== 0
      ? routeComparison
      : first.driverName.localeCompare(second.driverName);
  });
}

export function DailyEntryListScreen({
  navigation,
}: DailyEntryListScreenProps) {
  const selectedDate = useTransportStore(state => state.selectedDate);
  const setSelectedDate = useTransportStore(state => state.setSelectedDate);

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [hasFuelPrice, setHasFuelPrice] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rowErrorMessage, setRowErrorMessage] = useState<string | null>(null);
  const [settlingEntryId, setSettlingEntryId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

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
        setEntries(sortByRoute(fetchedEntries));
        setHasFuelPrice(fuelPrice !== null);
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadData(false);
    });
    return unsubscribe;
  }, [navigation, loadData]);

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
        sortByRoute(
          previous.map(existing =>
            existing.id === paidEntry.id ? paidEntry : existing,
          ),
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

  function handleDelete(entry: DailyEntry): void {
    Alert.alert(
      'Delete entry',
      `Remove ${entry.driverName}'s entry for this date? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void confirmDelete(entry),
        },
      ],
    );
  }

  async function confirmDelete(entry: DailyEntry): Promise<void> {
    setDeletingEntryId(entry.id);
    setRowErrorMessage(null);
    try {
      await deleteDailyEntry(entry.id);
      setEntries(previous =>
        previous.filter(existing => existing.id !== entry.id),
      );
    } catch (error) {
      setRowErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete entry.',
      );
    } finally {
      setDeletingEntryId(null);
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
        <View style={styles.list}>
          {Array.from({ length: 4 }, (_, index) => (
            <DailyEntryRowSkeleton key={index} />
          ))}
        </View>
      ) : errorMessage !== null ? (
        <EmptyState
          title="Couldn't load entries"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData(false)}
        />
      ) : (
        <>
          {!hasFuelPrice ? (
            <View style={styles.fuelPriceWarning}>
              <Text style={styles.fuelPriceWarningText}>
                No fuel price set for this date — attendance can still be
                logged, but fuel litres can't be entered until it's set.
              </Text>
            </View>
          ) : null}
          {entries.length > 0 ? (
            <View style={styles.summaryBar}>
              <Text style={styles.summaryText}>Vehicles: {entries.length}</Text>
              <Text style={styles.summaryText}>
                Fuel: {formatCurrency(totalFuelCost)}
              </Text>
              <Text style={styles.summaryText}>
                Payout: {formatCurrency(totalDriverPayout)}
              </Text>
            </View>
          ) : null}
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
            ListEmptyComponent={
              <EmptyState
                title="No entries yet"
                message="Add a driver's entry for this date using the button below."
              />
            }
            renderItem={({ item }) => (
              <DailyEntryRow
                entry={item}
                onPress={() =>
                  navigation.navigate('AddEditDailyEntry', {
                    date: selectedDate,
                    driverId: item.driverId,
                  })
                }
                onSettleNow={() => void handleSettleNow(item)}
                isSettling={settlingEntryId === item.id}
                onDelete={() => handleDelete(item)}
                isDeleting={deletingEntryId === item.id}
              />
            )}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() =>
              navigation.navigate('AddEditDailyEntry', { date: selectedDate })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.fabLabel}>+</Text>
          </TouchableOpacity>
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
  fuelPriceWarning: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: `${colors.warning}1A`,
    borderWidth: 1,
    borderColor: `${colors.warning}40`,
  },
  fuelPriceWarningText: {
    ...typography.caption,
    color: colors.warning,
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
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    ...typography.heading,
    color: colors.surface,
  },
});
