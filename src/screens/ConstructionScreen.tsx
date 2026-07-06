import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/theme/colors';

export function ConstructionScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <EmptyState
        title="Coming soon"
        message="The Construction module hasn't been built yet."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
