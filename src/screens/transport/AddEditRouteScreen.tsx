import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import {
  createRoute,
  fetchRouteById,
  updateRoute,
} from '@/services/routeService';
import {
  routeFormSchema,
  type Route,
  type RouteDraft,
  type RouteFormValues,
} from '@/types/route';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { TransportStackParamList } from '@/navigation/types';

type AddEditRouteScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'AddEditRoute'
>;

function toRouteDraft(values: RouteFormValues): RouteDraft {
  return {
    name: values.name,
    description: values.description,
    fuelLitres: Number(values.fuelLitres),
  };
}

export function AddEditRouteScreen({
  route,
  navigation,
}: AddEditRouteScreenProps) {
  const routeId = route.params.routeId;
  const isEditMode = routeId !== undefined;
  const [isLoadingRoute, setIsLoadingRoute] = useState(isEditMode);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [existingRoute, setExistingRoute] = useState<Route | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: { name: '', description: '', fuelLitres: '' },
  });

  useEffect(() => {
    if (routeId === undefined) {
      return;
    }

    let isMounted = true;
    setIsLoadingRoute(true);
    fetchRouteById(routeId)
      .then(fetchedRoute => {
        if (!isMounted) {
          return;
        }
        if (fetchedRoute === null) {
          setLoadErrorMessage('Route not found.');
          return;
        }
        reset({
          name: fetchedRoute.name,
          description: fetchedRoute.description,
          fuelLitres: String(fetchedRoute.fuelLitres ?? 0),
        });
        setExistingRoute(fetchedRoute);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }
        setLoadErrorMessage(
          error instanceof Error ? error.message : 'Failed to load route.',
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRoute(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [routeId, reset]);

  async function onSubmit(values: RouteFormValues): Promise<void> {
    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      const draft = toRouteDraft(values);
      if (routeId === undefined) {
        await createRoute(draft);
      } else if (existingRoute !== null) {
        await updateRoute({ ...existingRoute, ...draft });
      }
      navigation.goBack();
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save route.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoadingRoute) {
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
          title="Couldn't load route"
          message={loadErrorMessage}
          variant="error"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextInput
              label="Route name"
              value={field.value}
              onChangeText={field.onChange}
              errorMessage={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormTextInput
              label="Description (from - to)"
              value={field.value}
              onChangeText={field.onChange}
              errorMessage={errors.description?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="fuelLitres"
          render={({ field }) => (
            <FormTextInput
              label="Fuel per trip (litres)"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="decimal-pad"
              errorMessage={errors.fuelLitres?.message}
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
  saveError: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
