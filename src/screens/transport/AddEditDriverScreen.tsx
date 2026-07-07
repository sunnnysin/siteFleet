import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormTextInput } from '@/components/FormTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { SelectField } from '@/components/SelectField';
import {
  createDriver,
  fetchDriverById,
  updateDriver,
} from '@/services/driverService';
import { fetchRoutes } from '@/services/routeService';
import { dismissKeyboardAndWait } from '@/utils/navigationUtils';
import {
  driverFormSchema,
  VEHICLE_TYPES,
  type Driver,
  type DriverDraft,
  type DriverFormValues,
} from '@/types/driver';
import type { Route } from '@/types/route';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { TransportStackParamList } from '@/navigation/types';

type AddEditDriverScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'AddEditDriver'
>;

const VEHICLE_TYPE_OPTIONS = VEHICLE_TYPES.map(vehicleType => ({
  label: vehicleType,
  value: vehicleType,
}));

const DRIVER_TYPE_OPTIONS = [
  { label: 'Permanent', value: 'permanent' },
  { label: 'Temporary', value: 'temporary' },
];

function toDriverDraft(values: DriverFormValues): DriverDraft {
  return {
    name: values.name,
    phone: values.phone,
    upiId: values.upiId,
    vehicleNumber: values.vehicleNumber,
    vehicleType: values.vehicleType,
    routeId: values.driverType === 'temporary' ? '' : values.routeId,
    dailyRate: Number(values.dailyRate),
    driverType: values.driverType,
    isActive: true,
  };
}

export function AddEditDriverScreen({
  route,
  navigation,
}: AddEditDriverScreenProps) {
  const driverId = route.params.driverId;
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [existingDriver, setExistingDriver] = useState<Driver | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      upiId: '',
      vehicleNumber: '',
      vehicleType: 'ACE',
      routeId: '',
      dailyRate: '',
      driverType: 'permanent',
    },
  });

  const driverType = watch('driverType');

  const loadFormData = useCallback(async () => {
    setIsLoadingDriver(true);
    setLoadErrorMessage(null);
    try {
      const fetchedRoutes = await fetchRoutes();
      setRoutes(fetchedRoutes);

      if (driverId !== undefined) {
        const driver = await fetchDriverById(driverId);
        if (driver === null) {
          setLoadErrorMessage('Driver not found.');
          return;
        }
        reset({
          name: driver.name,
          phone: driver.phone,
          upiId: driver.upiId,
          vehicleNumber: driver.vehicleNumber,
          vehicleType: driver.vehicleType,
          routeId: driver.routeId,
          dailyRate: String(driver.dailyRate),
          driverType: driver.driverType,
        });
        setExistingDriver(driver);
      }
    } catch (error) {
      setLoadErrorMessage(
        error instanceof Error ? error.message : 'Failed to load form data.',
      );
    } finally {
      setIsLoadingDriver(false);
    }
  }, [driverId, reset]);

  useEffect(() => {
    void loadFormData();
  }, [loadFormData]);

  async function onSubmit(values: DriverFormValues): Promise<void> {
    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      const draft = toDriverDraft(values);
      if (driverId === undefined) {
        await createDriver(draft);
      } else if (existingDriver !== null) {
        await updateDriver({ ...existingDriver, ...draft });
      }
      await dismissKeyboardAndWait();
      navigation.goBack();
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save driver.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingDriver) {
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
          title="Couldn't load driver"
          message={loadErrorMessage}
          variant="error"
          onRetry={() => void loadFormData()}
        />
      </SafeAreaView>
    );
  }

  const routeOptions = routes.map(routeItem => ({
    label: `${routeItem.name} (${routeItem.description})`,
    value: routeItem.id,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormTextInput
                label="Name"
                value={field.value}
                onChangeText={field.onChange}
                errorMessage={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <FormTextInput
                label="Phone"
                value={field.value}
                onChangeText={value =>
                  field.onChange(value.replace(/[^0-9]/g, ''))
                }
                keyboardType="phone-pad"
                maxLength={10}
                errorMessage={errors.phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="upiId"
            render={({ field }) => (
              <FormTextInput
                label="UPI ID (optional)"
                value={field.value}
                onChangeText={field.onChange}
                autoCapitalize="none"
                errorMessage={errors.upiId?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="vehicleNumber"
            render={({ field }) => (
              <FormTextInput
                label="Vehicle number"
                value={field.value}
                onChangeText={value =>
                  field.onChange(value.replace(/[^0-9]/g, ''))
                }
                keyboardType="number-pad"
                maxLength={4}
                errorMessage={errors.vehicleNumber?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="vehicleType"
            render={({ field }) => (
              <SelectField
                label="Vehicle type"
                options={VEHICLE_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.vehicleType?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="driverType"
            render={({ field }) => (
              <SelectField
                label="Driver type"
                options={DRIVER_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                errorMessage={errors.driverType?.message}
              />
            )}
          />
          {driverType === 'permanent' ? (
            <Controller
              control={control}
              name="routeId"
              render={({ field }) => (
                <SelectField
                  label="Route"
                  options={routeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={
                    routeOptions.length === 0
                      ? 'Add a route first'
                      : 'Select a route'
                  }
                  errorMessage={errors.routeId?.message}
                />
              )}
            />
          ) : (
            <Text style={styles.routeHint}>
              Temporary drivers can go to any route — it is picked per day on
              the Daily Entries screen.
            </Text>
          )}
          <Controller
            control={control}
            name="dailyRate"
            render={({ field }) => (
              <FormTextInput
                label="Rate per day"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                errorMessage={errors.dailyRate?.message}
              />
            )}
          />
          {saveErrorMessage !== null ? (
            <Text style={styles.saveError}>{saveErrorMessage}</Text>
          ) : null}

          <View style={styles.saveButton}>
            <PrimaryButton
              label="Save"
              onPress={() => void handleSubmit(onSubmit)()}
              isLoading={isSaving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  routeHint: {
    color: colors.textSecondary,
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
