import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { SummaryCard } from '@/components/SummaryCard';
import { NavigationTile } from '@/components/NavigationTile';
import { fetchDailyEntriesForDate } from '@/services/dailyEntryService';
import { fetchFuelPriceForDate } from '@/services/fuelPriceService';
import { computeMonthlyPayments } from '@/services/paymentService';
import { currentMonthKey, todayKey } from '@/utils/dateUtils';
import { formatCurrency, formatCurrencyTrimmed } from '@/utils/currencyUtils';
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
  totalUnpaidAmount: number;
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [dailyEntries, fuelPrice, monthlyPayments] = await Promise.all([
        fetchDailyEntriesForDate(todayKey()),
        fetchFuelPriceForDate(todayKey()),
        computeMonthlyPayments(currentMonthKey()),
      ]);

      const totalUnpaidAmount = monthlyPayments
        .filter(payment => payment.paymentStatus === 'unpaid')
        .reduce((sum, payment) => sum + payment.amountDue, 0);

      setSummary({
        vehiclesOnRoute: dailyEntries.length,
        todaysFuelPrice: fuelPrice?.pricePerLitre ?? null,
        totalUnpaidAmount,
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
        <Text style={styles.sectionTitle}>Today's summary</Text>

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
          <View style={styles.cardRow}>
            <SummaryCard
              label="Vehicles on route"
              value={String(summary?.vehiclesOnRoute ?? 0)}
            />
            <SummaryCard
              label="Fuel price / litre"
              value={
                summary?.todaysFuelPrice !== null &&
                summary?.todaysFuelPrice !== undefined
                  ? formatCurrency(summary.todaysFuelPrice)
                  : 'Not set'
              }
            />
            <SummaryCard
              label="Unpaid outstanding"
              value={formatCurrencyTrimmed(summary?.totalUnpaidAmount ?? 0)}
            />
          </View>
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
            label="Set fuel price"
            onPress={() => navigation.navigate('FuelPrice')}
          />
          <NavigationTile
            label="Pump"
            onPress={() => navigation.navigate('Pump')}
          />
          <NavigationTile
            label="Daily entries"
            onPress={() => navigation.navigate('DailyEntryList')}
          />
          <NavigationTile
            label="Monthly payments"
            onPress={() => navigation.navigate('MonthlyPayment')}
          />
          <NavigationTile
            label="Summary"
            onPress={() => navigation.navigate('Summary')}
          />
          <NavigationTile
            label="Bill"
            onPress={() => navigation.navigate('Bill')}
          />
          <NavigationTile
            label="Goraul Summary"
            onPress={() => navigation.navigate('GoraulSummary')}
          />
          <NavigationTile
            label="Goraul Bill"
            onPress={() => navigation.navigate('GoraulBill')}
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
  loadingIndicator: {
    marginVertical: spacing.xl,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
