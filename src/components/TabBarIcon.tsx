import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { colors } from '@/theme/colors';

interface TabBarIconProps {
  source: ImageSourcePropType;
  isFocused: boolean;
}

export function TabBarIcon({ source, isFocused }: TabBarIconProps) {
  return (
    <Image
      source={source}
      style={[
        styles.icon,
        { tintColor: isFocused ? colors.primary : colors.textSecondary },
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 22,
    height: 22,
  },
});
