import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AssignmentRow } from '@/components/AssignmentRow';
import { DateNavigator } from '@/components/DateNavigator';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fetchDrivers } from '@/services/driverService';
import {
  fetchDailyEntry,
  fetchLatestAssignmentForDriver,
  saveDailyAssignment,
} from '@/services/dailyEntryService';
import { useTransportStore } from '@/stores/useTransportStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { AssignmentRowState } from '@/types/assignment';
import type { Driver } from '@/types/driver';

export function DailyAssignmentScreen() {
  const selectedDate = useTransportStore(state => state.selectedDate);
  const setSelectedDate = useTransportStore(state => state.setSelectedDate);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<
    Record<string, AssignmentRowState>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const activeDrivers = (await fetchDrivers()).filter(
        driver => driver.isActive,
      );

      const assignmentEntries = await Promise.all(
        activeDrivers.map(async driver => {
          const existingEntry = await fetchDailyEntry(selectedDate, driver.id);
          if (existingEntry !== null) {
            return [
              driver.id,
              {
                vehicleType: existingEntry.vehicleType,
                vehicleNumber: existingEntry.vehicleNumber,
                route: existingEntry.route,
                attendance: existingEntry.attendance,
              },
            ] as const;
          }

          const latestAssignment = await fetchLatestAssignmentForDriver(
            driver.id,
          );
          return [
            driver.id,
            {
              vehicleType: latestAssignment?.vehicleType ?? '',
              vehicleNumber: latestAssignment?.vehicleNumber ?? '',
              route: latestAssignment?.route ?? '',
              attendance: 'present',
            },
          ] as const;
        }),
      );

      setDrivers(activeDrivers);
      setAssignments(Object.fromEntries(assignmentEntries));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load assignments.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleRowChange(driverId: string, state: AssignmentRowState): void {
    setAssignments(previous => ({ ...previous, [driverId]: state }));
  }

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await Promise.all(
        drivers.map(driver => {
          const rowState = assignments[driver.id];
          if (rowState === undefined) {
            return Promise.resolve();
          }
          return saveDailyAssignment({
            date: selectedDate,
            driverId: driver.id,
            driverName: driver.name,
            ...rowState,
          });
        }),
      );
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save assignments.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DateNavigator selectedDate={selectedDate} onChange={setSelectedDate} />

      {isLoading ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.primary}
        />
      ) : errorMessage !== null ? (
        <EmptyState
          title="Couldn't load assignments"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      ) : drivers.length === 0 ? (
        <EmptyState
          title="No active drivers"
          message="Add active drivers before creating an assignment."
        />
      ) : (
        <>
          <FlatList
            data={drivers}
            keyExtractor={driver => driver.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const rowState = assignments[item.id];
              return rowState === undefined ? null : (
                <AssignmentRow
                  driver={item}
                  state={rowState}
                  onChange={state => handleRowChange(item.id, state)}
                />
              );
            }}
          />
          <View style={styles.footer}>
            {saveErrorMessage !== null ? (
              <Text style={styles.saveError}>{saveErrorMessage}</Text>
            ) : null}
            <PrimaryButton
              label="Save assignments"
              onPress={() => void handleSave()}
              isLoading={isSaving}
            />
          </View>
        </>
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
  list: {
    padding: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
  },
  saveError: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});
