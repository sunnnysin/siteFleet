import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import {
  fetchFuelPriceForDate,
  fetchRecentFuelPrices,
  setFuelPriceForDate,
} from '@/services/fuelPriceService';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatDisplayDate, todayKey } from '@/utils/dateUtils';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { FuelPrice } from '@/types/fuelPrice';

export function FuelPriceScreen() {
  const [priceInput, setPriceInput] = useState('');
  const [recentPrices, setRecentPrices] = useState<FuelPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [todaysPrice, recent] = await Promise.all([
        fetchFuelPriceForDate(todayKey()),
        fetchRecentFuelPrices(7),
      ]);
      if (todaysPrice !== null) {
        setPriceInput(String(todaysPrice.pricePerLitre));
      }
      setRecentPrices(recent);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load fuel prices.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSave(): Promise<void> {
    const pricePerLitre = Number(priceInput);
    if (!Number.isFinite(pricePerLitre) || pricePerLitre <= 0) {
      setSaveErrorMessage('Enter a valid price per litre.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await setFuelPriceForDate({ date: todayKey(), pricePerLitre });
      await loadData();
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save fuel price.',
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

  if (errorMessage !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Couldn't load fuel prices"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.form}>
        <Text style={styles.date}>{formatDisplayDate(todayKey())}</Text>
        <FormTextInput
          label="Price per litre"
          value={priceInput}
          onChangeText={setPriceInput}
          keyboardType="decimal-pad"
          errorMessage={saveErrorMessage ?? undefined}
        />
        <PrimaryButton
          label="Save"
          onPress={() => void handleSave()}
          isLoading={isSaving}
        />
      </View>

      <Text style={styles.sectionTitle}>Last 7 days</Text>
      {recentPrices.length === 0 ? (
        <EmptyState
          title="No history yet"
          message="Fuel prices you set will appear here."
        />
      ) : (
        <FlatList
          data={recentPrices}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <Text style={styles.historyDate}>
                {formatDisplayDate(item.date)}
              </Text>
              <Text style={styles.historyPrice}>
                {formatCurrency(item.pricePerLitre)}
              </Text>
            </View>
          )}
        />
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
  form: {
    padding: spacing.lg,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: {
    ...typography.body,
    color: colors.textPrimary,
  },
  historyPrice: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
