import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { MonthlyPaymentRow } from '@/components/MonthlyPaymentRow';
import { fetchDriverById } from '@/services/driverService';
import {
  computeMonthlyPayments,
  markMonthlyPaymentPaid,
} from '@/services/paymentService';
import { openUpiPayment } from '@/services/upiService';
import { useTransportStore } from '@/stores/useTransportStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { MonthlyPayment } from '@/types/payment';

export function MonthlyPaymentScreen() {
  const selectedMonth = useTransportStore(state => state.selectedMonth);
  const setSelectedMonth = useTransportStore(state => state.setSelectedMonth);

  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const monthlyPayments = await computeMonthlyPayments(selectedMonth);
      setPayments(monthlyPayments);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load payments.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handlePay(payment: MonthlyPayment): Promise<void> {
    setProcessingPaymentId(payment.id);
    setErrorMessage(null);
    try {
      const driver = await fetchDriverById(payment.driverId);
      if (driver === null) {
        throw new Error('Driver not found.');
      }
      await openUpiPayment(driver.upiId, driver.name, payment.amountDue);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to open UPI payment.',
      );
    } finally {
      setProcessingPaymentId(null);
    }
  }

  async function handleMarkPaid(payment: MonthlyPayment): Promise<void> {
    setProcessingPaymentId(payment.id);
    setErrorMessage(null);
    try {
      const paidPayment = await markMonthlyPaymentPaid(payment);
      setPayments(previous =>
        previous.map(existing =>
          existing.id === paidPayment.id ? paidPayment : existing,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to mark payment as paid.',
      );
    } finally {
      setProcessingPaymentId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <MonthNavigator
        selectedMonth={selectedMonth}
        onChange={setSelectedMonth}
      />

      {isLoading ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.primary}
        />
      ) : errorMessage !== null ? (
        <EmptyState
          title="Couldn't load payments"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments this month"
          message="Daily entries for this month will appear here once logged."
        />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={payment => payment.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MonthlyPaymentRow
              payment={item}
              onPay={() => void handlePay(item)}
              onMarkPaid={() => void handleMarkPaid(item)}
              isProcessing={processingPaymentId === item.id}
            />
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
  list: {
    padding: spacing.lg,
  },
});
