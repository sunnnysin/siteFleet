import { useEffect } from 'react';
import {
  ActivityIndicator,
  AppState,
  Keyboard,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import { subscribeToAuthChanges, upsertUserProfile } from '@/firebase/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/theme/colors';

function App() {
  const setUserProfile = useAuthStore(state => state.setUserProfile);
  const setAuthLoading = useAuthStore(state => state.setAuthLoading);
  const isAuthLoading = useAuthStore(state => state.isAuthLoading);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      if (user === null) {
        setUserProfile(null);
        setAuthLoading(false);
        return;
      }
      void upsertUserProfile(user)
        .then(setUserProfile)
        .finally(() => setAuthLoading(false));
    });
    return unsubscribe;
  }, [setUserProfile, setAuthLoading]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        Keyboard.dismiss();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {isAuthLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <AppNavigator />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default App;
