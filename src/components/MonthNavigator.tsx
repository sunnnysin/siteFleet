import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addMonths, format, parse, subMonths } from 'date-fns';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatMonthKey, MONTH_FORMAT } from '@/utils/dateUtils';
import { MonthPickerModal } from '@/components/MonthPickerModal';

interface MonthNavigatorProps {
  selectedMonth: string;
  onChange: (month: string) => void;
}

export function MonthNavigator({
  selectedMonth,
  onChange,
}: MonthNavigatorProps) {
  const parsedMonth = parse(selectedMonth, MONTH_FORMAT, new Date());
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => onChange(formatMonthKey(subMonths(parsedMonth, 1)))}
        activeOpacity={0.7}
      >
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsPickerVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.monthLabel}>
          {format(parsedMonth, 'MMMM yyyy')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => onChange(formatMonthKey(addMonths(parsedMonth, 1)))}
        activeOpacity={0.7}
      >
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <MonthPickerModal
        visible={isPickerVisible}
        selectedMonth={selectedMonth}
        onSelect={month => {
          onChange(month);
          setIsPickerVisible(false);
        }}
        onClose={() => setIsPickerVisible(false)}
      />
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
