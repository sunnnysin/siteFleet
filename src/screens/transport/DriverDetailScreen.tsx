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
import { fetchDailyEntriesForDriverAndMonth } from '@/services/dailyEntryService';
import { fetchRouteById } from '@/services/routeService';
import { shareDriverMonthlyReport } from '@/services/driverReportService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { currentMonthKey, MONTH_FORMAT } from '@/utils/dateUtils';
import { format, parse } from 'date-fns';
import type { TransportStackParamList } from '@/navigation/types';
import type { Driver } from '@/types/driver';
import type { DailyEntry } from '@/types/dailyEntry';

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
      const [fetchedRoute, fetchedEntries] = await Promise.all([
        fetchRouteById(fetchedDriver.routeId),
        fetchDailyEntriesForDriverAndMonth(driverId, selectedMonth),
      ]);
      setDriver(fetchedDriver);
      setRouteLabel(fetchedRoute?.name ?? 'Unknown route');
      setEntries(fetchedEntries);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load driver.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [driverId, selectedMonth]);

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
      await shareDriverMonthlyReport(driver, routeLabel, monthLabel, entries);
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={entries}
        keyExtractor={entry => entry.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <DriverDetailCard
              driver={driver}
              routeLabel={routeLabel}
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

            <Text style={styles.sectionTitle}>Monthly history</Text>
            <MonthNavigator
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
            />
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
  actionsRow: {
    marginTop: spacing.md,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
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
