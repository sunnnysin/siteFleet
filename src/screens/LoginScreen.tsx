import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import appIcon from '@/assets/appIcon.png';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { signInWithGoogle, upsertUserProfile } from '@/firebase/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function LoginScreen() {
  const setUserProfile = useAuthStore(state => state.setUserProfile);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignIn(): Promise<void> {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      const userProfile = await upsertUserProfile(user);
      setUserProfile(userProfile);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Sign-in failed. Please try again.',
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconSection}>
        <Image source={appIcon} style={styles.appIcon} />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.appName}>SiteFleet</Text>
        <Text style={styles.tagline}>Transport operations, in one place</Text>
      </View>
      <View style={styles.actionSection}>
        <GoogleSignInButton
          onPress={() => void handleSignIn()}
          isLoading={isSigningIn}
        />
        {errorMessage !== null ? (
          <Text style={styles.error}>{errorMessage}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  iconSection: {
    alignItems: 'center',
    paddingTop: 100,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  textSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  appName: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
  actionSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
