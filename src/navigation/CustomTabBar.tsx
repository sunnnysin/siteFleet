import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key] ?? {};
        const isFocused = state.index === index;
        const label = options?.title ?? route.name;

        function handlePress(): void {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <Pressable key={route.key} style={styles.tab} onPress={handlePress}>
            <View
              style={[
                styles.indicator,
                isFocused ? styles.activeIndicator : null,
              ]}
            />
            <View style={styles.content}>
              {options?.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? colors.primary : colors.textSecondary,
                size: 22,
              })}
              <Text
                style={[styles.label, isFocused ? styles.activeLabel : null]}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  indicator: {
    height: 3,
    alignSelf: 'stretch',
    marginHorizontal: spacing.md,
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
