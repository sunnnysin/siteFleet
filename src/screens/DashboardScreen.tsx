import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { SummaryCard } from '@/components/SummaryCard';
import { SummaryCardSkeleton } from '@/components/SummaryCardSkeleton';
import { NavigationTile } from '@/components/NavigationTile';
import {
  computeEffectiveFuelCost,
  fetchDailyEntriesForDate,
  fetchDailyEntriesForMonth,
} from '@/services/dailyEntryService';
import { fetchFuelPriceForDate } from '@/services/fuelPriceService';
import { computeMonthlyPayments } from '@/services/paymentService';
import { fetchDrivers } from '@/services/driverService';
import { computeVehicleTypeTotalsForMonth } from '@/services/vehicleSummaryService';
import {
  buildVehicleRateMap,
  fetchVehicleRates,
} from '@/services/vehicleRateService';
import { currentMonthKey, todayKey } from '@/utils/dateUtils';
import {
  formatCurrency,
  formatCurrencyTrimmed,
  roundToTwoDecimals,
} from '@/utils/currencyUtils';
import { VEHICLE_TYPES } from '@/types/driver';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { TransportStackParamList } from '@/navigation/types';

type DashboardScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'Dashboard'
>;

interface DashboardSummary {
  vehiclesOnRoute: number;
  todaysFuelPrice: number | null;
  totalDriverOutstanding: number;
  totalFuelOutstanding: number;
  totalOutstanding: number;
  totalSaving: number;
}

type MaskedCardKey =
  | 'totalOutstanding'
  | 'totalDriverOutstanding'
  | 'totalFuelOutstanding'
  | 'totalSaving';

const MASK_AUTO_HIDE_MS = 5000;

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visibleCards, setVisibleCards] = useState<Set<MaskedCardKey>>(
    new Set(),
  );
  const hideTimers = useRef<
    Partial<Record<MaskedCardKey, ReturnType<typeof setTimeout>>>
  >({});

  function handleToggleCardVisibility(key: MaskedCardKey): void {
    const existingTimer = hideTimers.current[key];
    if (existingTimer !== undefined) {
      clearTimeout(existingTimer);
      delete hideTimers.current[key];
    }
    setVisibleCards(previous => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        hideTimers.current[key] = setTimeout(() => {
          setVisibleCards(current => {
            const updated = new Set(current);
            updated.delete(key);
            return updated;
          });
          delete hideTimers.current[key];
        }, MASK_AUTO_HIDE_MS);
      }
      return next;
    });
  }

  useEffect(() => {
    const timers = hideTimers.current;
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const monthKey = currentMonthKey();
      const [
        dailyEntriesToday,
        monthEntries,
        fuelPrice,
        monthlyPayments,
        drivers,
        vehicleRates,
      ] = await Promise.all([
        fetchDailyEntriesForDate(todayKey()),
        fetchDailyEntriesForMonth(monthKey),
        fetchFuelPriceForDate(todayKey()),
        computeMonthlyPayments(monthKey),
        fetchDrivers(),
        fetchVehicleRates(),
      ]);

      const totalDriverOutstanding = roundToTwoDecimals(
        monthlyPayments.reduce(
          (sum, payment) =>
            sum + payment.totalAmount + payment.amountSettledSameDay,
          0,
        ),
      );

      const totalFuelOutstanding = roundToTwoDecimals(
        monthEntries.reduce(
          (sum, entry) => sum + computeEffectiveFuelCost(entry),
          0,
        ),
      );

      const totalOutstanding = roundToTwoDecimals(
        totalDriverOutstanding + totalFuelOutstanding,
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

      const totalSaving = roundToTwoDecimals(
        totalBillAmount - totalOutstanding,
      );

      setSummary({
        vehiclesOnRoute: dailyEntriesToday.length,
        todaysFuelPrice: fuelPrice?.pricePerLitre ?? null,
        totalDriverOutstanding,
        totalFuelOutstanding,
        totalOutstanding,
        totalSaving,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load dashboard data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Keyboard.dismiss();
      void loadSummary();
    });
    return unsubscribe;
  }, [navigation, loadSummary]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>
          {format(new Date(), 'MMMM')} Summary
        </Text>

        {isLoading ? (
          <>
            <View style={styles.cardRow}>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </View>
            <View style={[styles.cardRow, styles.cardRowSpacing]}>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </View>
          </>
        ) : errorMessage !== null ? (
          <EmptyState
            title="Couldn't load summary"
            message={errorMessage}
            variant="error"
            onRetry={() => void loadSummary()}
          />
        ) : (
          <>
            <View style={styles.cardRow}>
              <SummaryCard
                label="Vehicles on route"
                value={String(summary?.vehiclesOnRoute ?? 0)}
              />
              <SummaryCard
                label="Today's diesel rate"
                value={
                  summary?.todaysFuelPrice !== null &&
                  summary?.todaysFuelPrice !== undefined
                    ? formatCurrency(summary.todaysFuelPrice)
                    : 'Not set'
                }
              />
              <SummaryCard
                label="Total outstanding"
                value={formatCurrencyTrimmed(summary?.totalOutstanding ?? 0)}
                masked={!visibleCards.has('totalOutstanding')}
                onToggleMask={() =>
                  handleToggleCardVisibility('totalOutstanding')
                }
              />
            </View>
            <View style={[styles.cardRow, styles.cardRowSpacing]}>
              <SummaryCard
                label="Total driver outstanding"
                value={formatCurrencyTrimmed(
                  summary?.totalDriverOutstanding ?? 0,
                )}
                masked={!visibleCards.has('totalDriverOutstanding')}
                onToggleMask={() =>
                  handleToggleCardVisibility('totalDriverOutstanding')
                }
              />
              <SummaryCard
                label="Total fuel outstanding"
                value={formatCurrencyTrimmed(
                  summary?.totalFuelOutstanding ?? 0,
                )}
                masked={!visibleCards.has('totalFuelOutstanding')}
                onToggleMask={() =>
                  handleToggleCardVisibility('totalFuelOutstanding')
                }
              />
              <SummaryCard
                label="Total saving"
                value={formatCurrencyTrimmed(summary?.totalSaving ?? 0)}
                masked={!visibleCards.has('totalSaving')}
                onToggleMask={() => handleToggleCardVisibility('totalSaving')}
              />
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Transport</Text>
        <View style={styles.navigationList}>
          <NavigationTile
            label="Drivers"
            onPress={() => navigation.navigate('DriverList')}
          />
          <NavigationTile
            label="Routes"
            onPress={() => navigation.navigate('RouteList')}
          />
          <NavigationTile
            label="Daily entries"
            onPress={() => navigation.navigate('DailyEntryList')}
          />
          <NavigationTile
            label="Drivers Salary Payment"
            onPress={() => navigation.navigate('MonthlyPayment')}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Pump</Text>
        <View style={styles.navigationList}>
          <NavigationTile
            label="Set fuel price"
            onPress={() => navigation.navigate('FuelPrice')}
          />
          <NavigationTile
            label="Pump Monthly report"
            onPress={() => navigation.navigate('Pump')}
          />
          <NavigationTile
            label="Today Diesel Distribution"
            onPress={() => navigation.navigate('DieselDistribution')}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Bill</Text>
        <View style={styles.navigationList}>
          <NavigationTile
            label="Bill"
            onPress={() => navigation.navigate('Bill')}
          />
          <NavigationTile
            label="Summary"
            onPress={() => navigation.navigate('Summary')}
          />
          <NavigationTile
            label="Goraul Bill"
            onPress={() => navigation.navigate('GoraulBill')}
          />
          <NavigationTile
            label="Goraul Summary"
            onPress={() => navigation.navigate('GoraulSummary')}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>Monthly summary</Text>
        <View style={styles.navigationList}>
          <NavigationTile
            label="My Summary"
            onPress={() => navigation.navigate('MySummary')}
            isLast
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
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardRowSpacing: {
    marginTop: spacing.sm,
  },
  navigationList: {
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
});
