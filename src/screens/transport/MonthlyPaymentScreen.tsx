import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parse } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { MonthlyPaymentRow } from '@/components/MonthlyPaymentRow';
import { MonthlyPaymentRowSkeleton } from '@/components/MonthlyPaymentRowSkeleton';
import { UpiPaymentModal } from '@/components/UpiPaymentModal';
import {
  fetchDriverById,
  fetchDrivers,
  updateDriver,
} from '@/services/driverService';
import {
  computeMonthlyPayments,
  markMonthlyPaymentPaid,
  markMonthlyPaymentUnpaid,
} from '@/services/paymentService';
import {
  fetchAvailableUpiApps,
  openUpiAppDeepLink,
  type UpiAppOption,
} from '@/services/upiService';
import { useTransportStore } from '@/stores/useTransportStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { MONTH_FORMAT } from '@/utils/dateUtils';
import type { TransportStackParamList } from '@/navigation/types';
import type { Driver, DriverType } from '@/types/driver';
import type { MonthlyPayment } from '@/types/payment';

const UPI_ID_PATTERN = /^[\w.-]+@[a-zA-Z]+$/;

type UpiModalStep = 'closed' | 'upiId' | 'appPicker';

type MonthlyPaymentScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'MonthlyPayment'
>;

export function MonthlyPaymentScreen({
  navigation,
}: MonthlyPaymentScreenProps) {
  const selectedMonth = useTransportStore(state => state.selectedMonth);
  const setSelectedMonth = useTransportStore(state => state.setSelectedMonth);

  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [driverTypeByDriverId, setDriverTypeByDriverId] = useState<
    Map<string, DriverType>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(
    null,
  );

  const [modalStep, setModalStep] = useState<UpiModalStep>('closed');
  const [pendingPaymentDriver, setPendingPaymentDriver] = useState<{
    driver: Driver;
    payment: MonthlyPayment;
  } | null>(null);

  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiIdErrorMessage, setUpiIdErrorMessage] = useState<string | null>(
    null,
  );
  const [isSavingUpiId, setIsSavingUpiId] = useState(false);

  const [isLoadingUpiOptions, setIsLoadingUpiOptions] = useState(false);
  const [upiOptions, setUpiOptions] = useState<UpiAppOption[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [monthlyPayments, drivers] = await Promise.all([
        computeMonthlyPayments(selectedMonth),
        fetchDrivers(),
      ]);
      setPayments(monthlyPayments);
      setDriverTypeByDriverId(
        new Map(drivers.map(driver => [driver.id, driver.driverType])),
      );
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

  async function openAppPickerForDriver(
    driver: Driver,
    payment: MonthlyPayment,
  ): Promise<void> {
    const monthLabel = format(
      parse(selectedMonth, MONTH_FORMAT, new Date()),
      'MMMM yyyy',
    );
    const note = `Payment for ${driver.name} - ${monthLabel}`;

    setModalStep('appPicker');
    setIsLoadingUpiOptions(true);
    try {
      const options = await fetchAvailableUpiApps(
        driver.upiId,
        driver.name,
        payment.amountDue,
        note,
      );
      setUpiOptions(options);
    } catch (error) {
      setModalStep('closed');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to open UPI payment.',
      );
    } finally {
      setIsLoadingUpiOptions(false);
    }
  }

  async function handlePay(payment: MonthlyPayment): Promise<void> {
    setProcessingPaymentId(payment.id);
    setErrorMessage(null);
    try {
      const driver = await fetchDriverById(payment.driverId);
      if (driver === null) {
        throw new Error('Driver not found.');
      }
      if (driver.upiId.length === 0) {
        setPendingPaymentDriver({ driver, payment });
        setUpiIdInput('');
        setUpiIdErrorMessage(null);
        setModalStep('upiId');
        return;
      }

      await openAppPickerForDriver(driver, payment);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to open UPI payment.',
      );
    } finally {
      setProcessingPaymentId(null);
    }
  }

  async function handleSaveUpiId(): Promise<void> {
    if (pendingPaymentDriver === null) {
      return;
    }
    const trimmedUpiId = upiIdInput.trim();
    if (!UPI_ID_PATTERN.test(trimmedUpiId)) {
      setUpiIdErrorMessage('Enter a valid UPI ID, e.g. name@bank');
      return;
    }

    setIsSavingUpiId(true);
    setUpiIdErrorMessage(null);
    try {
      const { driver, payment } = pendingPaymentDriver;
      const updatedDriver = await updateDriver({
        ...driver,
        upiId: trimmedUpiId,
      });
      setPendingPaymentDriver(null);
      await openAppPickerForDriver(updatedDriver, payment);
    } catch (error) {
      setUpiIdErrorMessage(
        error instanceof Error ? error.message : 'Failed to save UPI ID.',
      );
    } finally {
      setIsSavingUpiId(false);
    }
  }

  function closeModal(): void {
    setModalStep('closed');
    setPendingPaymentDriver(null);
    setUpiIdErrorMessage(null);
    setUpiOptions([]);
  }

  async function handleSelectUpiApp(option: UpiAppOption): Promise<void> {
    closeModal();
    try {
      await openUpiAppDeepLink(option.url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Failed to open ${option.app.label}.`,
      );
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

  async function handleMarkUnpaid(payment: MonthlyPayment): Promise<void> {
    setProcessingPaymentId(payment.id);
    setErrorMessage(null);
    try {
      const unpaidPayment = await markMonthlyPaymentUnpaid(payment);
      setPayments(previous =>
        previous.map(existing =>
          existing.id === unpaidPayment.id ? unpaidPayment : existing,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to mark payment as unpaid.',
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
        <View style={styles.list}>
          {Array.from({ length: 5 }, (_, index) => (
            <MonthlyPaymentRowSkeleton key={index} />
          ))}
        </View>
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
              driverType={driverTypeByDriverId.get(item.driverId) ?? null}
              onPress={() =>
                navigation.navigate('DriverDetail', {
                  driverId: item.driverId,
                })
              }
              onPay={() => void handlePay(item)}
              onMarkPaid={() => void handleMarkPaid(item)}
              onMarkUnpaid={() => void handleMarkUnpaid(item)}
              isProcessing={processingPaymentId === item.id}
            />
          )}
        />
      )}

      <UpiPaymentModal
        visible={modalStep !== 'closed'}
        step={modalStep === 'upiId' ? 'upiId' : 'appPicker'}
        onClose={closeModal}
        driverName={pendingPaymentDriver?.driver.name ?? ''}
        upiIdValue={upiIdInput}
        onChangeUpiId={setUpiIdInput}
        upiIdErrorMessage={upiIdErrorMessage ?? undefined}
        isSavingUpiId={isSavingUpiId}
        onSaveUpiId={() => void handleSaveUpiId()}
        isLoadingApps={isLoadingUpiOptions}
        appOptions={upiOptions}
        onSelectApp={option => void handleSelectUpiApp(option)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
});
