import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { SummaryCard } from '@/components/SummaryCard';
import {
  computeEffectiveFuelCost,
  fetchDailyEntriesForMonth,
} from '@/services/dailyEntryService';
import { computeMonthlyPayments } from '@/services/paymentService';
import { fetchDrivers } from '@/services/driverService';
import { computeVehicleTypeTotalsForMonth } from '@/services/vehicleSummaryService';
import {
  buildVehicleRateMap,
  fetchVehicleRates,
} from '@/services/vehicleRateService';
import { currentMonthKey } from '@/utils/dateUtils';
import {
  formatCurrencyTrimmed,
  roundToTwoDecimals,
} from '@/utils/currencyUtils';
import { VEHICLE_TYPES } from '@/types/driver';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface MonthSummary {
  totalPayment: number;
  totalDriverPayment: number;
  totalFuelPayment: number;
  totalBillAmount: number;
  totalSaving: number;
}

export function MySummaryScreen() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [monthEntries, monthlyPayments, drivers, vehicleRates] =
        await Promise.all([
          fetchDailyEntriesForMonth(selectedMonth),
          computeMonthlyPayments(selectedMonth),
          fetchDrivers(),
          fetchVehicleRates(),
        ]);

      const totalDriverPayment = roundToTwoDecimals(
        monthlyPayments.reduce(
          (sum, payment) =>
            sum + payment.totalAmount + payment.amountSettledSameDay,
          0,
        ),
      );

      const totalFuelPayment = roundToTwoDecimals(
        monthEntries.reduce(
          (sum, entry) => sum + computeEffectiveFuelCost(entry),
          0,
        ),
      );

      const totalPayment = roundToTwoDecimals(
        totalDriverPayment + totalFuelPayment,
      );

      const driverVehicleTypes = new Map(
        drivers.map(driver => [driver.id, driver.vehicleType]),
      );
      const vehicleTotals = computeVehicleTypeTotalsForMonth(
        monthEntries,
        driverVehicleTypes,
      );
      const rateMap = buildVehicleRateMap(vehicleRates);
      const totalBillAmount = VEHICLE_TYPES.reduce(
        (sum, type) => sum + vehicleTotals[type] * rateMap[type],
        0,
      );

      const totalSaving = roundToTwoDecimals(totalBillAmount - totalPayment);

      setSummary({
        totalPayment,
        totalDriverPayment,
        totalFuelPayment,
        totalBillAmount: roundToTwoDecimals(totalBillAmount),
        totalSaving,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load summary.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <MonthNavigator
        selectedMonth={selectedMonth}
        onChange={setSelectedMonth}
      />

      {isLoading ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.primary}
        />
      ) : errorMessage !== null ? (
        <EmptyState
          title="Couldn't load summary"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadSummary()}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.cardRow}>
            <SummaryCard
              label="Total driver payment"
              value={formatCurrencyTrimmed(summary?.totalDriverPayment ?? 0)}
            />
            <SummaryCard
              label="Total fuel payment"
              value={formatCurrencyTrimmed(summary?.totalFuelPayment ?? 0)}
            />
          </View>
          <View style={[styles.cardRow, styles.cardRowSpacing]}>
            <SummaryCard
              label="Total payment"
              value={formatCurrencyTrimmed(summary?.totalPayment ?? 0)}
            />
            <SummaryCard
              label="Total billed amount"
              value={formatCurrencyTrimmed(summary?.totalBillAmount ?? 0)}
            />
          </View>
          <View style={[styles.cardRow, styles.cardRowSpacing]}>
            <SummaryCard
              label="Total saving"
              value={formatCurrencyTrimmed(summary?.totalSaving ?? 0)}
            />
          </View>
        </View>
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
  content: {
    padding: spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardRowSpacing: {
    marginTop: spacing.sm,
  },
});
