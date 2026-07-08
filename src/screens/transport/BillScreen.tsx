import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parse } from 'date-fns';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { fetchDailyEntriesForMonth } from '@/services/dailyEntryService';
import { fetchDrivers } from '@/services/driverService';
import { computeVehicleTypeTotalsForMonth } from '@/services/vehicleSummaryService';
import {
  fetchVehicleRates,
  buildVehicleRateMap,
  setVehicleRate,
} from '@/services/vehicleRateService';
import {
  shareBillReport,
  VEHICLE_TYPE_BILL_LABELS,
} from '@/services/billReportService';
import { formatCurrency } from '@/utils/currencyUtils';
import { currentMonthKey, MONTH_FORMAT } from '@/utils/dateUtils';
import { VEHICLE_TYPES, type VehicleType } from '@/types/driver';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function BillScreen() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [rateInputs, setRateInputs] = useState<Record<VehicleType, string>>(
    () =>
      Object.fromEntries(VEHICLE_TYPES.map(type => [type, ''])) as Record<
        VehicleType,
        string
      >,
  );
  const [vehicleTotals, setVehicleTotals] = useState<
    Record<VehicleType, number>
  >(
    () =>
      Object.fromEntries(VEHICLE_TYPES.map(type => [type, 0])) as Record<
        VehicleType,
        number
      >,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingRates, setIsSavingRates] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [rates, entries, drivers] = await Promise.all([
        fetchVehicleRates(),
        fetchDailyEntriesForMonth(selectedMonth),
        fetchDrivers(),
      ]);
      const rateMap = buildVehicleRateMap(rates);
      setRateInputs(
        Object.fromEntries(
          VEHICLE_TYPES.map(type => [type, String(rateMap[type])]),
        ) as Record<VehicleType, string>,
      );
      const driverVehicleTypes = new Map(
        drivers.map(driver => [driver.id, driver.vehicleType]),
      );
      setVehicleTotals(
        computeVehicleTypeTotalsForMonth(entries, driverVehicleTypes),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load bill data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSaveRates(): Promise<void> {
    const parsedRates = VEHICLE_TYPES.map(type => ({
      vehicleType: type,
      ratePerTrip: Number(rateInputs[type]),
    }));
    const hasInvalidRate = parsedRates.some(
      rate => !Number.isFinite(rate.ratePerTrip) || rate.ratePerTrip < 0,
    );
    if (hasInvalidRate) {
      setSaveErrorMessage('Enter a valid rate for each vehicle type.');
      return;
    }

    setIsSavingRates(true);
    setSaveErrorMessage(null);
    try {
      await Promise.all(parsedRates.map(rate => setVehicleRate(rate)));
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save rates.',
      );
    } finally {
      setIsSavingRates(false);
    }
  }

  async function handleExport(): Promise<void> {
    setIsExporting(true);
    setExportErrorMessage(null);
    try {
      const parsedMonth = parse(selectedMonth, MONTH_FORMAT, new Date());
      const monthLabel = `${format(parsedMonth, 'MMMM')}- ${format(
        parsedMonth,
        'yyyy',
      )}`;
      const lineItems = VEHICLE_TYPES.map(type => ({
        vehicleType: type,
        nos: vehicleTotals[type],
        ratePerTrip: Number(rateInputs[type]) || 0,
      }));
      await shareBillReport(monthLabel, lineItems);
    } catch (error) {
      setExportErrorMessage(
        error instanceof Error ? error.message : 'Failed to export bill.',
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
          title="Couldn't load bill data"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  const totalAmount = VEHICLE_TYPES.reduce(
    (sum, type) => sum + vehicleTotals[type] * (Number(rateInputs[type]) || 0),
    0,
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthNavigator}>
          <MonthNavigator
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />
        </View>

        <Text style={styles.sectionTitle}>Rate per trip</Text>
        {VEHICLE_TYPES.map(type => (
          <FormTextInput
            key={type}
            label={VEHICLE_TYPE_BILL_LABELS[type]}
            value={rateInputs[type]}
            onChangeText={value =>
              setRateInputs(current => ({ ...current, [type]: value }))
            }
            keyboardType="decimal-pad"
          />
        ))}
        {saveErrorMessage !== null ? (
          <Text style={styles.errorText}>{saveErrorMessage}</Text>
        ) : null}
        <PrimaryButton
          label="Save rates"
          onPress={() => void handleSaveRates()}
          variant="secondary"
          isLoading={isSavingRates}
        />

        <Text style={styles.sectionTitle}>This month</Text>
        <View style={styles.cardContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>
              Particulars
            </Text>
            <Text
              style={[styles.tableCell, styles.tableHeaderText, styles.center]}
            >
              Nos.
            </Text>
            <Text
              style={[styles.tableCell, styles.tableHeaderText, styles.right]}
            >
              Amount
            </Text>
          </View>
          {VEHICLE_TYPES.map(type => (
            <View key={type} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {VEHICLE_TYPE_BILL_LABELS[type]}
              </Text>
              <Text style={[styles.tableCell, styles.center]}>
                {vehicleTotals[type]}
              </Text>
              <Text style={[styles.tableCell, styles.right]}>
                {formatCurrency(
                  vehicleTotals[type] * (Number(rateInputs[type]) || 0),
                )}
              </Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.tableRowLast]}>
            <Text style={[styles.tableCell, styles.totalLabel]}>
              Total amount
            </Text>
            <Text style={styles.tableCell} />
            <Text style={[styles.tableCell, styles.right, styles.totalLabel]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        {exportErrorMessage !== null ? (
          <Text style={styles.errorText}>{exportErrorMessage}</Text>
        ) : null}
        <View style={styles.exportButton}>
          <PrimaryButton
            label="Download bill"
            onPress={() => void handleExport()}
            isLoading={isExporting}
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
  loadingIndicator: {
    marginTop: spacing.xl,
  },
  content: {
    padding: spacing.lg,
  },
  monthNavigator: {
    marginHorizontal: -spacing.lg,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
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
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: spacing.sm,
  },
  tableHeaderText: {
    fontWeight: '600',
  },
  totalLabel: {
    fontWeight: '700',
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
  exportButton: {
    marginTop: spacing.lg,
  },
});
