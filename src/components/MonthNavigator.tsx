import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addMonths, format, parse, subMonths } from 'date-fns';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatMonthKey, MONTH_FORMAT } from '@/utils/dateUtils';

interface MonthNavigatorProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export function MonthNavigator({
  selectedMonth,
  onChange,
}: MonthNavigatorProps) {
  const parsedMonth = parse(selectedMonth, MONTH_FORMAT, new Date());

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.arrowButton}
        onPress={() => onChange(formatMonthKey(subMonths(parsedMonth, 1)))}
      >
        <Text style={styles.arrow}>‹</Text>
      </Pressable>
      <Text style={styles.monthLabel}>{format(parsedMonth, 'MMMM yyyy')}</Text>
      <Pressable
        style={styles.arrowButton}
        onPress={() => onChange(formatMonthKey(addMonths(parsedMonth, 1)))}
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
  monthLabel: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
});
