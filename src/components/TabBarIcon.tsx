import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

interface TabBarIconProps {
  source: ImageSourcePropType;
  isFocused: boolean;
}

export function TabBarIcon({ source, isFocused }: TabBarIconProps) {
  return (
    <View
      style={[styles.container, isFocused ? styles.focusedContainer : null]}
    >
      <Image
        source={source}
        style={[
          styles.icon,
          { tintColor: isFocused ? colors.primary : colors.textSecondary },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedContainer: {
    backgroundColor: `${colors.primary}1A`,
  },
  icon: {
    width: 22,
    height: 22,
    marginTop: spacing.xs / 2,
  },
});
