import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DriverAdvanceRow } from '@/components/DriverAdvanceRow';
import { DriverDetailCard } from '@/components/DriverDetailCard';
import { DriverDetailCardSkeleton } from '@/components/DriverDetailCardSkeleton';
import { DriverHistoryRow } from '@/components/DriverHistoryRow';
import { DriverHistoryRowSkeleton } from '@/components/DriverHistoryRowSkeleton';
import { DriverPaymentRow } from '@/components/DriverPaymentRow';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Shimmer } from '@/components/Shimmer';
import { deleteDriver, fetchDriverById } from '@/services/driverService';
import {
  computeDriverFuelBalance,
  fetchAllDailyEntriesForDriver,
  filterEntriesForMonth,
} from '@/services/dailyEntryService';
import {
  computeTotalAdvance,
  fetchAllDriverAdvances,
  filterAdvancesForMonth,
} from '@/services/driverAdvanceService';
import { computeDriverBalance } from '@/services/driverBalanceService';
import {
  deleteDriverPayment,
  fetchAllDriverPayments,
  filterPaymentsForMonth,
} from '@/services/driverPaymentService';
import { fetchRouteById } from '@/services/routeService';
import { shareDriverMonthlyReport } from '@/services/driverReportService';
import { computeMonthlyPayments } from '@/services/paymentService';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import { currentMonthKey, MONTH_FORMAT } from '@/utils/dateUtils';
import { dismissKeyboardAndWait } from '@/utils/navigationUtils';
import { format, parse } from 'date-fns';
import type { TransportStackParamList } from '@/navigation/types';
import type { Driver } from '@/types/driver';
import type { DriverAdvance } from '@/types/driverAdvance';
import type { DriverPayment } from '@/types/driverPayment';
import type { DailyEntry, PaymentStatus } from '@/types/dailyEntry';

type HistoryRowItem =
  | {
      kind: 'entry';
      date: string;
      entry: DailyEntry;
      advanceAmount?: number;
    }
  | { kind: 'advance'; date: string; advance: DriverAdvance };

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
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [allAdvances, setAllAdvances] = useState<DriverAdvance[]>([]);
  const [allPayments, setAllPayments] = useState<DriverPayment[]>([]);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null,
  );
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
      const [
        fetchedRoute,
        fetchedEntries,
        fetchedAdvances,
        fetchedPayments,
        monthlyPayments,
      ] = await Promise.all([
        fetchedDriver.routeId.length > 0
          ? fetchRouteById(fetchedDriver.routeId)
          : Promise.resolve(null),
        fetchAllDailyEntriesForDriver(driverId),
        fetchAllDriverAdvances(driverId),
        fetchAllDriverPayments(driverId),
        computeMonthlyPayments(selectedMonth),
      ]);
      setDriver(fetchedDriver);
      setRouteLabel(
        fetchedDriver.routeId.length > 0
          ? fetchedRoute?.name ?? 'Unknown route'
          : 'Undecided',
      );
      setAllEntries(fetchedEntries);
      setAllAdvances(fetchedAdvances);
      setAllPayments(fetchedPayments);
      setMonthlyPaymentStatus(
        monthlyPayments.find(payment => payment.driverId === driverId)
          ?.paymentStatus ?? null,
      );
      setFuelBalance(
        computeDriverFuelBalance(
          filterEntriesForMonth(fetchedEntries, selectedMonth),
        ),
      );
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

  function handleDeletePayment(payment: DriverPayment): void {
    Alert.alert(
      'Delete payment',
      `Remove the ${formatCurrency(payment.amount)} payment from ${format(
        parse(payment.date, 'yyyy-MM-dd', new Date()),
        'dd MMM yyyy',
      )}? The remaining balance will increase.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void confirmDeletePayment(payment.id),
        },
      ],
    );
  }

  async function confirmDeletePayment(paymentId: string): Promise<void> {
    setDeletingPaymentId(paymentId);
    try {
      await deleteDriverPayment(paymentId);
      setAllPayments(previous =>
        previous.filter(payment => payment.id !== paymentId),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete payment.',
      );
    } finally {
      setDeletingPaymentId(null);
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
        fuelBalance,
        advanceTotal,
        monthlyPaymentStatus,
        payments,
        balance,
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
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView contentContainerStyle={styles.list}>
          <View style={styles.monthNavigator}>
            <MonthNavigator
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
            />
          </View>
          <DriverDetailCardSkeleton />
          <View style={styles.actionsRow}>
            <Shimmer style={styles.actionButtonSkeleton} />
            <Shimmer style={styles.actionButtonSkeleton} />
            <Shimmer style={styles.actionButtonSkeleton} />
          </View>

          <View style={styles.sectionTitleRow}>
            <Shimmer style={styles.sectionTitleSkeleton} />
            <Shimmer style={styles.monthlyTotalSkeleton} />
          </View>

          <View style={styles.cardContainer}>
            {Array.from({ length: 5 }, (_, index) => (
              <DriverHistoryRowSkeleton key={index} isLast={index === 4} />
            ))}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Shimmer style={styles.footerButtonSkeleton} />
        </View>
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

  const entries = filterEntriesForMonth(allEntries, selectedMonth);
  const advances = filterAdvancesForMonth(allAdvances, selectedMonth);
  const payments = filterPaymentsForMonth(allPayments, selectedMonth);
  const totalMonthlyPay = entries.reduce(
    (sum, entry) =>
      sum + (entry.attendance === 'present' ? driver.dailyRate : 0),
    0,
  );
  const totalMonthlyFuel = entries.reduce(
    (sum, entry) => sum + entry.fuelLitres,
    0,
  );
  const advanceTotal = computeTotalAdvance(advances);
  const balance = computeDriverBalance(
    selectedMonth,
    driver.dailyRate,
    allEntries,
    allAdvances,
    allPayments,
  );

  const advanceAmountByDate = new Map(
    advances.map(advance => [advance.date, advance.amount]),
  );
  const entryDates = new Set(entries.map(entry => entry.date));

  const historyRows: HistoryRowItem[] = [
    ...entries.map(
      (entry): HistoryRowItem => ({
        kind: 'entry',
        date: entry.date,
        entry,
        advanceAmount: advanceAmountByDate.get(entry.date),
      }),
    ),
    ...advances
      .filter(advance => !entryDates.has(advance.date))
      .map(
        (advance): HistoryRowItem => ({
          kind: 'advance',
          date: advance.date,
          advance,
        }),
      ),
  ].sort((first, second) => first.date.localeCompare(second.date));

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.list}>
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
          fuelBalance={fuelBalance}
          advanceMoney={advanceTotal}
          balance={balance}
          onEdit={() => navigation.navigate('AddEditDriver', { driverId })}
        />
        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Add advance"
              onPress={() =>
                navigation.navigate('AddDriverAdvance', { driverId })
              }
              variant="secondary"
              size="small"
            />
          </View>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Make payment"
              onPress={() =>
                navigation.navigate('AddDriverPayment', { driverId })
              }
              size="small"
            />
          </View>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Delete driver"
              onPress={handleDelete}
              variant="danger"
              isLoading={isDeleting}
              size="small"
            />
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Monthly history</Text>
          <Text style={styles.monthlyTotal}>
            {formatCurrency(totalMonthlyPay)}
          </Text>
        </View>

        {historyRows.length === 0 ? (
          <EmptyState
            title="No entries this month"
            message="No daily entries recorded for this driver in the selected month."
          />
        ) : (
          <View style={styles.cardContainer}>
            {historyRows.map((row, index) =>
              row.kind === 'entry' ? (
                <DriverHistoryRow
                  key={`entry_${row.entry.id}`}
                  entry={row.entry}
                  advanceAmount={row.advanceAmount}
                  isLast={index === historyRows.length - 1}
                />
              ) : (
                <DriverAdvanceRow
                  key={`advance_${row.advance.id}`}
                  advance={row.advance}
                  isLast={index === historyRows.length - 1}
                />
              ),
            )}
          </View>
        )}

        {payments.length > 0 ? (
          <>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Payments</Text>
              <Text style={styles.monthlyTotal}>
                {formatCurrency(balance.paidTotal)}
              </Text>
            </View>
            <View style={styles.cardContainer}>
              {payments.map((payment, index) => (
                <DriverPaymentRow
                  key={payment.id}
                  payment={payment}
                  onDelete={() => handleDeletePayment(payment)}
                  isDeleting={deletingPaymentId === payment.id}
                  isLast={index === payments.length - 1}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

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
  list: {
    padding: spacing.lg,
  },
  monthNavigator: {
    marginHorizontal: -spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonSkeleton: {
    flex: 1,
    height: 40,
    borderRadius: radii.md,
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
  sectionTitleSkeleton: {
    width: 130,
    height: 18,
  },
  monthlyTotalSkeleton: {
    width: 70,
    height: 15,
  },
  cardContainer: {
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
  footerButtonSkeleton: {
    height: 48,
    borderRadius: radii.md,
  },
  exportError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
