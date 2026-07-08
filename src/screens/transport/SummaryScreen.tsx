import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { fetchDailyEntriesForMonth } from '@/services/dailyEntryService';
import { fetchDrivers } from '@/services/driverService';
import {
  computeDailyVehicleTypeCounts,
  type DailyVehicleTypeCounts,
} from '@/services/vehicleSummaryService';
import { shareSummaryReport } from '@/services/summaryReportService';
import {
  currentMonthKey,
  formatDisplayDateWithWeekdayNoYear,
} from '@/utils/dateUtils';
import { VEHICLE_TYPES } from '@/types/driver';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function SummaryScreen() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [dailyCounts, setDailyCounts] = useState<DailyVehicleTypeCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [entries, drivers] = await Promise.all([
        fetchDailyEntriesForMonth(selectedMonth),
        fetchDrivers(),
      ]);
      const driverVehicleTypes = new Map(
        drivers.map(driver => [driver.id, driver.vehicleType]),
      );
      setDailyCounts(
        computeDailyVehicleTypeCounts(entries, driverVehicleTypes),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load summary.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleExport(): Promise<void> {
    setIsExporting(true);
    setExportErrorMessage(null);
    try {
      await shareSummaryReport(selectedMonth, dailyCounts);
    } catch (error) {
      setExportErrorMessage(
        error instanceof Error ? error.message : 'Failed to export summary.',
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
          title="Couldn't load summary"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  const grandTotals = VEHICLE_TYPES.map(type =>
    dailyCounts.reduce((sum, day) => sum + day.counts[type], 0),
  );
  const grandTotal = dailyCounts.reduce((sum, day) => sum + day.total, 0);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.monthNavigator}>
          <MonthNavigator
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />
        </View>

        {dailyCounts.length === 0 ? (
          <EmptyState
            title="No entries this month"
            message="Daily entries for this month will appear here, grouped by vehicle type."
          />
        ) : (
          <View style={styles.cardContainer}>
            <View style={styles.tableHeaderRow}>
              <Text
                style={[styles.tableCell, styles.dateCell, styles.headerText]}
              >
                Date
              </Text>
              {VEHICLE_TYPES.map(type => (
                <Text
                  key={type}
                  style={[styles.tableCell, styles.headerText, styles.center]}
                >
                  {type}
                </Text>
              ))}
              <Text
                style={[styles.tableCell, styles.headerText, styles.center]}
              >
                Total
              </Text>
            </View>

            {dailyCounts.map(item => (
              <View key={item.date} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.dateCell]}>
                  {formatDisplayDateWithWeekdayNoYear(item.date)}
                </Text>
                {VEHICLE_TYPES.map(type => (
                  <Text key={type} style={[styles.tableCell, styles.center]}>
                    {item.counts[type]}
                  </Text>
                ))}
                <Text
                  style={[styles.tableCell, styles.center, styles.totalText]}
                >
                  {item.total}
                </Text>
              </View>
            ))}

            <View style={styles.tableFooterRow}>
              <Text
                style={[styles.tableCell, styles.dateCell, styles.totalText]}
              >
                Grand total
              </Text>
              {grandTotals.map((total, index) => (
                <Text
                  key={VEHICLE_TYPES[index]}
                  style={[styles.tableCell, styles.center, styles.totalText]}
                >
                  {total}
                </Text>
              ))}
              <Text style={[styles.tableCell, styles.center, styles.totalText]}>
                {grandTotal}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {exportErrorMessage !== null ? (
          <Text style={styles.exportError}>{exportErrorMessage}</Text>
        ) : null}
        <PrimaryButton
          label="Generate summary"
          onPress={() => void handleExport()}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: spacing.sm,
  },
  dateCell: {
    flex: 1.4,
  },
  headerText: {
    fontWeight: '600',
  },
  totalText: {
    fontWeight: '700',
  },
  center: {
    textAlign: 'center',
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
