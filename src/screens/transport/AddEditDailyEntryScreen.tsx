import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { SelectField } from '@/components/SelectField';
import { fetchDrivers } from '@/services/driverService';
import { fetchRoutes } from '@/services/routeService';
import {
  fetchDailyEntriesForDate,
  fetchDailyEntry,
  saveDailyEntry,
} from '@/services/dailyEntryService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatDisplayDate } from '@/utils/dateUtils';
import type { TransportStackParamList } from '@/navigation/types';
import type { AttendanceStatus } from '@/types/dailyEntry';
import type { Driver } from '@/types/driver';
import type { Route } from '@/types/route';

type AddEditDailyEntryScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'AddEditDailyEntry'
>;

const ATTENDANCE_TABS = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
];

export function AddEditDailyEntryScreen({
  route,
  navigation,
}: AddEditDailyEntryScreenProps) {
  const { date, driverId } = route.params;
  const isEditMode = driverId !== undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [lockedDriver, setLockedDriver] = useState<Driver | null>(null);

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(
    driverId ?? null,
  );
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStatus>('present');
  const [fuelLitres, setFuelLitres] = useState('0');

  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadErrorMessage(null);
    try {
      const [fetchedRoutes, fetchedDrivers, entriesForDate] = await Promise.all(
        [fetchRoutes(), fetchDrivers(), fetchDailyEntriesForDate(date)],
      );
      setRoutes(fetchedRoutes);

      if (isEditMode) {
        const driver = fetchedDrivers.find(item => item.id === driverId);
        const existingEntry = await fetchDailyEntry(date, driverId);
        if (driver === undefined || existingEntry === null) {
          setLoadErrorMessage('Entry not found.');
          return;
        }
        setLockedDriver(driver);
        setSelectedRouteId(
          fetchedRoutes.find(item => item.name === existingEntry.route)?.id ??
            null,
        );
        setAttendance(existingEntry.attendance);
        setFuelLitres(String(existingEntry.fuelLitres));
      } else {
        const takenDriverIds = new Set(
          entriesForDate.map(entry => entry.driverId),
        );
        setAvailableDrivers(
          fetchedDrivers.filter(
            driver => driver.isActive && !takenDriverIds.has(driver.id),
          ),
        );
      }
    } catch (error) {
      setLoadErrorMessage(
        error instanceof Error ? error.message : 'Failed to load form data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [date, driverId, isEditMode]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleSelectDriver(newDriverId: string): void {
    setSelectedDriverId(newDriverId);
    const driver = availableDrivers.find(item => item.id === newDriverId);
    if (driver !== undefined) {
      setSelectedRouteId(driver.routeId);
    }
  }

  async function handleSave(): Promise<void> {
    const driver = isEditMode
      ? lockedDriver
      : availableDrivers.find(item => item.id === selectedDriverId) ?? null;

    if (driver === null) {
      setSaveErrorMessage('Select a driver.');
      return;
    }
    if (selectedRouteId === null) {
      setSaveErrorMessage('Select a route.');
      return;
    }

    const routeName = routes.find(item => item.id === selectedRouteId)?.name;
    if (routeName === undefined) {
      setSaveErrorMessage('Select a route.');
      return;
    }

    const parsedFuelLitres = Number(fuelLitres);
    if (!Number.isFinite(parsedFuelLitres) || parsedFuelLitres < 0) {
      setSaveErrorMessage('Enter a valid fuel amount.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await saveDailyEntry(driver, {
        date,
        driverId: driver.id,
        route: routeName,
        attendance,
        fuelLitres: parsedFuelLitres,
      });
      navigation.goBack();
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save entry.',
      );
    } finally {
      setIsSaving(false);
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

  if (loadErrorMessage !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Couldn't load entry"
          message={loadErrorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  const driverOptions = availableDrivers.map(driver => ({
    label: driver.name,
    value: driver.id,
  }));

  const routeOptions = routes.map(routeItem => ({
    label: `${routeItem.name} (${routeItem.description})`,
    value: routeItem.id,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.dateLabel}>{formatDisplayDate(date)}</Text>

        {isEditMode ? (
          <View style={styles.lockedDriverField}>
            <Text style={styles.lockedDriverLabel}>Driver</Text>
            <Text style={styles.lockedDriverValue}>{lockedDriver?.name}</Text>
          </View>
        ) : (
          <SelectField
            label="Driver"
            options={driverOptions}
            value={selectedDriverId}
            onChange={handleSelectDriver}
            placeholder={
              driverOptions.length === 0
                ? 'All drivers already have an entry today'
                : 'Select a driver'
            }
          />
        )}

        <SelectField
          label="Route"
          options={routeOptions}
          value={selectedRouteId}
          onChange={setSelectedRouteId}
          placeholder="Select a route"
        />

        <Text style={styles.fieldLabel}>Attendance</Text>
        <View style={styles.attendanceTabs}>
          <SegmentedTabs
            options={ATTENDANCE_TABS}
            value={attendance}
            onChange={value => setAttendance(value as AttendanceStatus)}
          />
        </View>

        <FormTextInput
          label="Fuel litres"
          value={fuelLitres}
          onChangeText={setFuelLitres}
          keyboardType="decimal-pad"
        />

        {saveErrorMessage !== null ? (
          <Text style={styles.saveError}>{saveErrorMessage}</Text>
        ) : null}

        <View style={styles.saveButton}>
          <PrimaryButton
            label="Save"
            onPress={() => void handleSave()}
            isLoading={isSaving}
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
  loadingIndicator: {
    marginTop: spacing.xl,
  },
  dateLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  lockedDriverField: {
    marginBottom: spacing.md,
  },
  lockedDriverLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  lockedDriverValue: {
    color: colors.textPrimary,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  attendanceTabs: {
    marginBottom: spacing.md,
  },
  saveError: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
