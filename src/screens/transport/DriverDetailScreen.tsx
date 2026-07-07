import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverDetailCard } from '@/components/DriverDetailCard';
import { DriverHistoryRow } from '@/components/DriverHistoryRow';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { PrimaryButton } from '@/components/PrimaryButton';
import { deleteDriver, fetchDriverById } from '@/services/driverService';
import {
  computeDriverFuelBalance,
  fetchAllDailyEntriesForDriver,
  fetchDailyEntriesForDriverAndMonth,
} from '@/services/dailyEntryService';
import { fetchRouteById } from '@/services/routeService';
import { shareDriverMonthlyReport } from '@/services/driverReportService';
import { computeMonthlyPayments } from '@/services/paymentService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import {
  currentMonthKey,
  formatDateKey,
  MONTH_FORMAT,
  parseDateKey,
} from '@/utils/dateUtils';
import { dismissKeyboardAndWait } from '@/utils/navigationUtils';
import { addMonths, format, parse } from 'date-fns';
import type { TransportStackParamList } from '@/navigation/types';
import type { Driver } from '@/types/driver';
import type { DailyEntry, PaymentStatus } from '@/types/dailyEntry';

type DriverDetailScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'DriverDetail'
>;

export function DriverDetailScreen({
  route,
  navigation,
}: DriverDetailScreenProps) {
  const driverId = route.params.driverId;
  const [driver, setDriver] = useState<Driver | null>(null);
  const [routeLabel, setRouteLabel] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [carriedForwardFuel, setCarriedForwardFuel] = useState(0);
  const [fuelBalance, setFuelBalance] = useState(0);
  const [monthlyPaymentStatus, setMonthlyPaymentStatus] =
    useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fetchedDriver = await fetchDriverById(driverId);
      if (fetchedDriver === null) {
        setErrorMessage('Driver not found.');
        return;
      }
      const [fetchedRoute, fetchedEntries, fetchedAllEntries, monthlyPayments] =
        await Promise.all([
          fetchedDriver.routeId.length > 0
            ? fetchRouteById(fetchedDriver.routeId)
            : Promise.resolve(null),
          fetchDailyEntriesForDriverAndMonth(driverId, selectedMonth),
          fetchAllDailyEntriesForDriver(driverId),
          computeMonthlyPayments(selectedMonth),
        ]);
      setDriver(fetchedDriver);
      setRouteLabel(
        fetchedDriver.routeId.length > 0
          ? fetchedRoute?.name ?? 'Unknown route'
          : 'Undecided',
      );
      setEntries(fetchedEntries);
      setMonthlyPaymentStatus(
        monthlyPayments.find(payment => payment.driverId === driverId)
          ?.paymentStatus ?? null,
      );

      const monthStartKey = `${selectedMonth}-01`;
      const nextMonthStartKey = formatDateKey(
        addMonths(parseDateKey(monthStartKey), 1),
      );
      const carriedForwardEntries = fetchedAllEntries.filter(
        entry => entry.date < monthStartKey,
      );
      const entriesThroughMonth = fetchedAllEntries.filter(
        entry => entry.date < nextMonthStartKey,
      );
      setCarriedForwardFuel(computeDriverFuelBalance(carriedForwardEntries));
      setFuelBalance(computeDriverFuelBalance(entriesThroughMonth));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load driver.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [driverId, selectedMonth]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  function handleDelete(): void {
    Alert.alert(
      'Delete driver',
      'This driver will be removed from your list. Their past daily entries and reports are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void confirmDelete(),
        },
      ],
    );
  }

  async function confirmDelete(): Promise<void> {
    setIsDeleting(true);
    try {
      await deleteDriver(driverId);
      await dismissKeyboardAndWait();
      navigation.goBack();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete driver.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleExport(): Promise<void> {
    if (driver === null) {
      return;
    }
    setIsExporting(true);
    setExportErrorMessage(null);
    try {
      const monthLabel = format(
        parse(selectedMonth, MONTH_FORMAT, new Date()),
        'MMMM yyyy',
      );
      await shareDriverMonthlyReport(
        driver,
        routeLabel,
        monthLabel,
        entries,
        carriedForwardFuel,
        fuelBalance,
        monthlyPaymentStatus,
      );
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

  if (errorMessage !== null || driver === null) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Couldn't load driver"
          message={errorMessage ?? 'Driver not found.'}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  const totalMonthlyPay = entries.reduce(
    (sum, entry) =>
      sum + (entry.attendance === 'present' ? driver.dailyRate : 0),
    0,
  );
  const totalMonthlyFuel = entries.reduce(
    (sum, entry) => sum + entry.fuelLitres,
    0,
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <FlatList
        data={entries}
        keyExtractor={entry => entry.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.monthNavigator}>
              <MonthNavigator
                selectedMonth={selectedMonth}
                onChange={setSelectedMonth}
              />
            </View>
            <DriverDetailCard
              driver={driver}
              routeLabel={routeLabel}
              monthlyFuelTaken={totalMonthlyFuel}
              carriedForwardFuel={carriedForwardFuel}
              fuelBalance={fuelBalance}
              onEdit={() => navigation.navigate('AddEditDriver', { driverId })}
            />
            <View style={styles.actionsRow}>
              <View style={styles.actionButton}>
                <PrimaryButton
                  label="Delete driver"
                  onPress={handleDelete}
                  variant="danger"
                  isLoading={isDeleting}
                />
              </View>
            </View>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Monthly history</Text>
              <Text style={styles.monthlyTotal}>
                {formatCurrency(totalMonthlyPay)}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No entries this month"
            message="No daily entries recorded for this driver in the selected month."
          />
        }
        renderItem={({ item }) => <DriverHistoryRow entry={item} />}
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
  list: {
    padding: spacing.lg,
  },
  monthNavigator: {
    marginHorizontal: -spacing.lg,
  },
  actionsRow: {
    marginTop: spacing.md,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  monthlyTotal: {
    ...typography.body,
    color: colors.textSecondary,
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
