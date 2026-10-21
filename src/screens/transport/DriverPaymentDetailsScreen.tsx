import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeletedBadge } from '@/components/DeletedBadge';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { Shimmer } from '@/components/Shimmer';
import { fetchAllDailyEntries } from '@/services/dailyEntryService';
import { fetchAllOwnerDriverAdvances } from '@/services/driverAdvanceService';
import {
  computeAllDriverBalances,
  type DriverBalanceRow,
} from '@/services/driverBalanceService';
import { fetchAllOwnerDriverPayments } from '@/services/driverPaymentService';
import { fetchDrivers } from '@/services/driverService';
import { formatCurrency } from '@/utils/currencyUtils';
import {
  currentMonthKey,
  formatDisplayDateWithWeekdayNoYear,
} from '@/utils/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DailyEntry } from '@/types/dailyEntry';
import type { Driver } from '@/types/driver';
import type { DriverAdvance } from '@/types/driverAdvance';
import type { DriverPayment } from '@/types/driverPayment';

const SKELETON_ROW_COUNT = 6;

interface PaymentDetailsData {
  drivers: Driver[];
  entries: DailyEntry[];
  advances: DriverAdvance[];
  payments: DriverPayment[];
}

function buildRows(
  data: PaymentDetailsData,
  selectedMonth: string,
): DriverBalanceRow[] {
  return computeAllDriverBalances(selectedMonth, data.drivers, data)
    .filter(
      row =>
        row.balance.totalSalary !== 0 ||
        row.balance.remaining !== 0 ||
        row.payments.length > 0,
    )
    .sort((first, second) => first.driverName.localeCompare(second.driverName));
}

function formatRemaining(amount: number): string {
  return amount < 0
    ? `${formatCurrency(Math.abs(amount))} (excess)`
    : formatCurrency(amount);
}

export function DriverPaymentDetailsScreen() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [data, setData] = useState<PaymentDetailsData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setErrorMessage(null);
    try {
      const [drivers, entries, advances, payments] = await Promise.all([
        fetchDrivers(),
        fetchAllDailyEntries(),
        fetchAllOwnerDriverAdvances(),
        fetchAllOwnerDriverPayments(),
      ]);
      setData({ drivers, entries, advances, payments });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load payment details.',
      );
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const isLoading = data === null && errorMessage === null;
  const rows = useMemo(
    () => (data === null ? [] : buildRows(data, selectedMonth)),
    [data, selectedMonth],
  );

  const tableHeader = (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.tableCell, styles.driverCell, styles.headerText]}>
        Driver
      </Text>
      <Text style={[styles.tableCell, styles.amountCell, styles.headerText]}>
        Remaining
      </Text>
      <Text style={[styles.tableCell, styles.amountCell, styles.headerText]}>
        Paid
      </Text>
      <Text style={[styles.tableCell, styles.datesCell, styles.headerText]}>
        Paid on
      </Text>
    </View>
  );

  if (errorMessage !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Couldn't load payment details"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  const totalPaid = rows.reduce((sum, row) => sum + row.balance.paidTotal, 0);
  const totalRemaining = rows.reduce(
    (sum, row) => sum + Math.max(row.balance.remaining, 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.monthNavigator}>
          <MonthNavigator
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />
        </View>

        {isLoading ? (
          <View style={styles.cardContainer}>
            {tableHeader}
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
              <View key={index} style={styles.tableRow}>
                <Shimmer style={styles.driverCellSkeleton} />
                <Shimmer style={styles.cellSkeleton} />
                <Shimmer style={styles.cellSkeleton} />
                <Shimmer style={styles.datesCellSkeleton} />
              </View>
            ))}
          </View>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No payment details"
            message="Drivers with salary or payments in this month will appear here."
          />
        ) : (
          <View style={styles.cardContainer}>
            {tableHeader}
            {rows.map(row => (
              <View key={row.driverId} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.driverCell]}>
                  <Text style={styles.driverNameText}>{row.driverName}</Text>
                  {row.isDeleted ? <DeletedBadge /> : null}
                </View>
                <Text
                  style={[
                    styles.tableCell,
                    styles.amountCell,
                    row.balance.remaining > 0 ? styles.dueText : null,
                  ]}
                >
                  {formatRemaining(row.balance.remaining)}
                </Text>
                <Text style={[styles.tableCell, styles.amountCell]}>
                  {formatCurrency(row.balance.paidTotal)}
                </Text>
                <View style={[styles.tableCell, styles.datesCell]}>
                  {row.payments.length === 0 ? (
                    <Text style={styles.dateLine}>-</Text>
                  ) : (
                    row.payments.map(payment => (
                      <Text key={payment.id} style={styles.dateLine}>
                        {formatDisplayDateWithWeekdayNoYear(payment.date)}
                        {' · '}
                        {formatCurrency(payment.amount)}
                      </Text>
                    ))
                  )}
                </View>
              </View>
            ))}

            <View style={styles.tableFooterRow}>
              <Text
                style={[styles.tableCell, styles.driverCell, styles.totalText]}
              >
                Total
              </Text>
              <Text
                style={[styles.tableCell, styles.amountCell, styles.totalText]}
              >
                {formatCurrency(totalRemaining)}
              </Text>
              <Text
                style={[styles.tableCell, styles.amountCell, styles.totalText]}
              >
                {formatCurrency(totalPaid)}
              </Text>
              <View style={[styles.tableCell, styles.datesCell]} />
            </View>
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  monthNavigator: {
    marginHorizontal: -spacing.lg,
  },
  cardContainer: {
    marginTop: spacing.md,
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
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableFooterRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  tableCell: {
    ...typography.caption,
    color: colors.textPrimary,
    padding: spacing.sm,
  },
  driverNameText: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  driverCell: {
    flex: 1.2,
  },
  amountCell: {
    flex: 1,
    textAlign: 'right',
  },
  datesCell: {
    flex: 1.6,
  },
  dateLine: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  dueText: {
    color: colors.danger,
    fontWeight: '600',
  },
  headerText: {
    fontWeight: '600',
  },
  totalText: {
    fontWeight: '700',
  },
  driverCellSkeleton: {
    flex: 1.2,
    height: 13,
    margin: spacing.sm,
  },
  cellSkeleton: {
    flex: 1,
    height: 13,
    margin: spacing.sm,
  },
  datesCellSkeleton: {
    flex: 1.6,
    height: 13,
    margin: spacing.sm,
  },
});
