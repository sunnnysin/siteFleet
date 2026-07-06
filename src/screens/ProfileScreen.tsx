import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { signOutOfApp } from '@/firebase/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function ProfileScreen() {
  const userProfile = useAuthStore(state => state.userProfile);
  const setUserProfile = useAuthStore(state => state.setUserProfile);

  async function handleSignOut(): Promise<void> {
    await signOutOfApp();
    setUserProfile(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.card}>
          {userProfile?.photoUrl !== null &&
          userProfile?.photoUrl !== undefined ? (
            <Image
              source={{ uri: userProfile.photoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(userProfile?.displayName ?? userProfile?.email ?? '?')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.name}>{userProfile?.displayName ?? 'Admin'}</Text>
          <Text style={styles.email}>{userProfile?.email ?? ''}</Text>
        </View>

        <View style={styles.signOutButton}>
          <PrimaryButton
            label="Sign out"
            onPress={() => void handleSignOut()}
            variant="danger"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    ...typography.heading,
    color: colors.surface,
  },
  name: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  signOutButton: {
    marginBottom: spacing.lg,
  },
});
