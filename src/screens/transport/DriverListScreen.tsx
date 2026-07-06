import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { FormTextInput } from '@/components/FormTextInput';
import { DriverListItem } from '@/components/DriverListItem';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { fetchDrivers, setDriverActiveStatus } from '@/services/driverService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { TransportStackParamList } from '@/navigation/types';
import type { Driver, DriverType } from '@/types/driver';

const DRIVER_TYPE_TABS = [
  { label: 'Permanent', value: 'permanent' },
  { label: 'Replacement', value: 'replacement' },
];

type DriverListScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'DriverList'
>;

export function DriverListScreen({ navigation }: DriverListScreenProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverType, setSelectedDriverType] =
    useState<DriverType>('permanent');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDrivers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fetchedDrivers = await fetchDrivers();
      setDrivers(fetchedDrivers);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load drivers.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadDrivers();
    });
    return unsubscribe;
  }, [navigation, loadDrivers]);

  async function handleToggleActive(driver: Driver): Promise<void> {
    try {
      const updatedDriver = await setDriverActiveStatus(
        driver,
        !driver.isActive,
      );
      setDrivers(previousDrivers =>
        previousDrivers.map(existingDriver =>
          existingDriver.id === updatedDriver.id
            ? updatedDriver
            : existingDriver,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update driver.',
      );
    }
  }

  const filteredDrivers = drivers.filter(
    driver =>
      driver.driverType === selectedDriverType &&
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchWrapper}>
        <SegmentedTabs
          options={DRIVER_TYPE_TABS}
          value={selectedDriverType}
          onChange={value => setSelectedDriverType(value as DriverType)}
        />
        <FormTextInput
          label="Search"
          placeholder="Search by name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.primary}
        />
      ) : errorMessage !== null ? (
        <EmptyState
          title="Couldn't load drivers"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadDrivers()}
        />
      ) : filteredDrivers.length === 0 ? (
        <EmptyState
          title="No drivers found"
          message="Add a driver using the button below to get started."
        />
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={driver => driver.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DriverListItem
              driver={item}
              onPress={() =>
                navigation.navigate('AddEditDriver', { driverId: item.id })
              }
              onToggleActive={() => void handleToggleActive(item)}
            />
          )}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditDriver', {})}
      >
        <Text style={styles.fabLabel}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  loadingIndicator: {
    marginTop: spacing.xl,
  },
  list: {
    padding: spacing.lg,
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
});
