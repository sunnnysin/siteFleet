import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateNavigator } from '@/components/DateNavigator';
import { DriverTypeBadge } from '@/components/DriverTypeBadge';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FormTextInput } from '@/components/FormTextInput';
import { fetchDrivers } from '@/services/driverService';
import {
  fetchDieselDistributionForDate,
  saveDieselDistributionEntries,
} from '@/services/dieselDistributionService';
import { shareDieselDistributionReport } from '@/services/dieselDistributionReportService';
import { todayKey } from '@/utils/dateUtils';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Driver } from '@/types/driver';

interface DistributionRow {
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  litres: string;
}

function formatLitresForDisplay(value: number): string {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    return String(value);
  }
  return value < 10 ? String(value).padStart(2, '0') : String(value);
}

export function DieselDistributionScreen() {
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rows, setRows] = useState<DistributionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pickerStep, setPickerStep] = useState<
    'closed' | 'selectDriver' | 'enterLitres'
  >('closed');
  const [pendingDriver, setPendingDriver] = useState<Driver | null>(null);
  const [pendingLitres, setPendingLitres] = useState('');
  const [pendingLitresError, setPendingLitresError] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [fetchedDrivers, existingEntries] = await Promise.all([
        fetchDrivers(),
        fetchDieselDistributionForDate(selectedDate),
      ]);
      setDrivers(fetchedDrivers.filter(driver => driver.isActive));
      setRows(
        [...existingEntries]
          .sort((first, second) =>
            first.driverName.localeCompare(second.driverName),
          )
          .map(entry => ({
            driverId: entry.driverId,
            driverName: entry.driverName,
            vehicleNumber: entry.vehicleNumber,
            litres: formatLitresForDisplay(entry.litres),
          })),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to load diesel distribution data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleClosePicker(): void {
    setPickerStep('closed');
    setPendingDriver(null);
    setPendingLitres('');
    setPendingLitresError(null);
  }

  function handleSelectDriverForAdd(driver: Driver): void {
    setPendingDriver(driver);
    setPendingLitres('');
    setPendingLitresError(null);
    setPickerStep('enterLitres');
  }

  function handleConfirmPendingLitres(): void {
    if (pendingDriver === null) {
      return;
    }
    const litres =
      pendingLitres.trim().length === 0 ? 0 : Number(pendingLitres);
    if (!Number.isFinite(litres) || litres < 0) {
      setPendingLitresError('Enter a valid litres amount.');
      return;
    }
    setRows(previous => [
      ...previous,
      {
        driverId: pendingDriver.id,
        driverName: pendingDriver.name,
        vehicleNumber: pendingDriver.vehicleNumber,
        litres: formatLitresForDisplay(litres),
      },
    ]);
    handleClosePicker();
  }

  function handleRemoveRow(driverId: string): void {
    setRows(previous => previous.filter(row => row.driverId !== driverId));
  }

  function handleChangeLitres(driverId: string, value: string): void {
    setRows(previous =>
      previous.map(row =>
        row.driverId === driverId ? { ...row, litres: value } : row,
      ),
    );
  }

  function handleBlurLitres(driverId: string): void {
    setRows(previous =>
      previous.map(row => {
        if (row.driverId !== driverId) {
          return row;
        }
        const litres = Number(row.litres);
        return Number.isFinite(litres) && litres >= 0
          ? { ...row, litres: formatLitresForDisplay(litres) }
          : row;
      }),
    );
  }

  async function handleSave(): Promise<void> {
    const drafts: {
      driverId: string;
      driverName: string;
      vehicleNumber: string;
      litres: number;
    }[] = [];
    for (const row of rows) {
      const litres = Number(row.litres);
      if (!Number.isFinite(litres) || litres < 0) {
        setSaveErrorMessage(
          `Enter a valid litres amount for ${row.driverName}.`,
        );
        return;
      }
      drafts.push({
        driverId: row.driverId,
        driverName: row.driverName,
        vehicleNumber: row.vehicleNumber,
        litres,
      });
    }

    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await saveDieselDistributionEntries(selectedDate, drafts);
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExport(): Promise<void> {
    setIsExporting(true);
    setExportErrorMessage(null);
    try {
      const lineItems = rows.map(row => ({
        driverName: row.driverName,
        vehicleNumber: row.vehicleNumber,
        litres: Number(row.litres) || 0,
      }));
      await shareDieselDistributionReport(selectedDate, lineItems);
    } catch (error) {
      setExportErrorMessage(
        error instanceof Error ? error.message : 'Failed to export report.',
      );
    } finally {
      setIsExporting(false);
    }
  }

  const addedDriverIds = new Set(rows.map(row => row.driverId));
  const availableDrivers = drivers.filter(
    driver => !addedDriverIds.has(driver.id),
  );

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
          title="Couldn't load diesel distribution"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />

      <ScrollView contentContainerStyle={styles.content}>
        {rows.length === 0 ? (
          <EmptyState
            title="No drivers added yet"
            message="Tap the + button to add drivers taking fuel today."
          />
        ) : (
          <View style={styles.cardContainer}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>
                Driver
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableHeaderText,
                  styles.center,
                ]}
              >
                Vehicle
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableHeaderText,
                  styles.litresCell,
                ]}
              >
                Litres
              </Text>
              <View style={styles.removeCell} />
            </View>
            {rows.map((row, index) => (
              <View
                key={row.driverId}
                style={[
                  styles.tableRow,
                  index === rows.length - 1 && styles.tableRowLast,
                ]}
              >
                <Text style={styles.tableCell}>{row.driverName}</Text>
                <Text style={[styles.tableCell, styles.center]}>
                  {row.vehicleNumber}
                </Text>
                <TextInput
                  style={[
                    styles.tableCell,
                    styles.litresCell,
                    styles.litresInput,
                  ]}
                  value={row.litres}
                  onChangeText={value =>
                    handleChangeLitres(row.driverId, value)
                  }
                  onBlur={() => handleBlurLitres(row.driverId)}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={styles.removeCell}
                  onPress={() => handleRemoveRow(row.driverId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeLabel}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {saveErrorMessage !== null ? (
          <Text style={styles.errorText}>{saveErrorMessage}</Text>
        ) : null}
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Save"
            onPress={() => void handleSave()}
            isLoading={isSaving}
          />
        </View>

        {exportErrorMessage !== null ? (
          <Text style={styles.errorText}>{exportErrorMessage}</Text>
        ) : null}
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Generate report"
            onPress={() => void handleExport()}
            variant="secondary"
            isLoading={isExporting}
            isDisabled={rows.length === 0}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setPickerStep('selectDriver')}
        activeOpacity={0.7}
      >
        <Text style={styles.fabLabel}>+</Text>
      </TouchableOpacity>

      {pickerStep !== 'closed' ? (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.backdrop} onPress={handleClosePicker}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              {pickerStep === 'selectDriver' ? (
                <>
                  <Text style={styles.sheetTitle}>Select driver</Text>
                  <FlatList
                    data={availableDrivers}
                    keyExtractor={driver => driver.id}
                    ListEmptyComponent={
                      <Text style={styles.emptyPickerText}>
                        All drivers have already been added.
                      </Text>
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => handleSelectDriverForAdd(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.optionLabelRow}>
                          <Text style={styles.optionLabel}>{item.name}</Text>
                          {item.driverType === 'temporary' ? (
                            <DriverTypeBadge driverType={item.driverType} />
                          ) : null}
                        </View>
                        <Text style={styles.optionMeta}>
                          {item.vehicleNumber}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.sheetTitle}>
                    {pendingDriver?.name} — litres
                  </Text>
                  <Text style={styles.pendingVehicle}>
                    {pendingDriver?.vehicleNumber}
                  </Text>
                  <FormTextInput
                    label="Fuel litres"
                    value={pendingLitres}
                    onChangeText={setPendingLitres}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    autoFocus
                    errorMessage={pendingLitresError ?? undefined}
                  />
                  <PrimaryButton
                    label="Add"
                    onPress={handleConfirmPendingLitres}
                  />
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
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
    paddingBottom: spacing.xxl,
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
    alignItems: 'center',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  center: {
    textAlign: 'center',
  },
  litresCell: {
    flex: 0.8,
    textAlign: 'right',
  },
  litresInput: {
    borderWidth: 0,
    padding: spacing.sm,
  },
  removeCell: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: {
    ...typography.body,
    color: colors.danger,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  actionRow: {
    marginTop: spacing.md,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '60%',
  },
  sheetTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  optionMeta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pendingVehicle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyPickerText: {
    ...typography.body,
    color: colors.textSecondary,
    paddingVertical: spacing.md,
  },
});
