import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface PickerGridItem {
  key: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}

interface PickerGridProps {
  items: PickerGridItem[];
}

export function PickerGrid({ items }: PickerGridProps) {
  return (
    <View style={styles.grid}>
      {items.map(item => (
        <TouchableOpacity
          key={item.key}
          style={styles.cell}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.cellLabel,
              item.selected && styles.cellLabelSelected,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '33.3333%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  cellLabel: {
    ...typography.body,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  cellLabelSelected: {
    backgroundColor: colors.primary,
    color: colors.surface,
    fontWeight: '600',
  },
});
