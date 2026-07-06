import { Image, StyleSheet } from 'react-native';
import googleLogo from '@/assets/google.png';

export function GoogleLogo() {
  return <Image source={googleLogo} style={styles.logo} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  logo: {
    width: 20,
    height: 20,
  },
});
