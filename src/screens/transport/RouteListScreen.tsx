import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/components/EmptyState';
import { RouteListItem } from '@/components/RouteListItem';
import { deleteRoute, fetchRoutes } from '@/services/routeService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { TransportStackParamList } from '@/navigation/types';
import type { Route } from '@/types/route';

type RouteListScreenProps = NativeStackScreenProps<
  TransportStackParamList,
  'RouteList'
>;

export function RouteListScreen({ navigation }: RouteListScreenProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);

  const loadRoutes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fetchedRoutes = await fetchRoutes();
      setRoutes(fetchedRoutes);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load routes.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadRoutes();
    });
    return unsubscribe;
  }, [navigation, loadRoutes]);

  function handleDelete(route: Route): void {
    Alert.alert(
      'Delete route',
      `Delete "${route.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void confirmDelete(route),
        },
      ],
    );
  }

  async function confirmDelete(route: Route): Promise<void> {
    setDeletingRouteId(route.id);
    try {
      await deleteRoute(route.id);
      setRoutes(previousRoutes =>
        previousRoutes.filter(existingRoute => existingRoute.id !== route.id),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete route.',
      );
    } finally {
      setDeletingRouteId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={colors.primary}
        />
      ) : errorMessage !== null ? (
        <EmptyState
          title="Couldn't load routes"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadRoutes()}
        />
      ) : routes.length === 0 ? (
        <EmptyState
          title="No routes yet"
          message="Add a route using the button below to get started."
        />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={route => route.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RouteListItem
              route={item}
              onPress={() =>
                navigation.navigate('AddEditRoute', { routeId: item.id })
              }
              onDelete={() => handleDelete(item)}
              isDeleting={deletingRouteId === item.id}
            />
          )}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditRoute', {})}
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
