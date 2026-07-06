import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addDays, subDays } from 'date-fns';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  formatDateKey,
  formatDisplayDate,
  parseDateKey,
} from '@/utils/dateUtils';

interface DateNavigatorProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export function DateNavigator({ selectedDate, onChange }: DateNavigatorProps) {
  const parsedDate = parseDateKey(selectedDate);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.arrowButton}
        onPress={() => onChange(formatDateKey(subDays(parsedDate, 1)))}
      >
        <Text style={styles.arrow}>‹</Text>
      </Pressable>
      <Text style={styles.dateLabel}>{formatDisplayDate(selectedDate)}</Text>
      <Pressable
        style={styles.arrowButton}
        onPress={() => onChange(formatDateKey(addDays(parsedDate, 1)))}
      >
        <Text style={styles.arrow}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  arrowButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  arrow: {
    ...typography.heading,
    color: colors.primary,
  },
  dateLabel: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
});
