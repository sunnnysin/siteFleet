import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface SegmentedTabOption {
  label: string;
  value: string;
}

interface SegmentedTabsProps {
  options: SegmentedTabOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedTabs({
  options,
  value,
  onChange,
}: SegmentedTabsProps) {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.tab, isSelected ? styles.selectedTab : null]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.label, isSelected ? styles.selectedLabel : null]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.xs / 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  selectedTab: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  selectedLabel: {
    color: colors.surface,
  },
});
