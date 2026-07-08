import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addDays, subDays } from 'date-fns';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import {
  formatDateKey,
  formatDisplayDateWithWeekday,
  parseDateKey,
} from '@/utils/dateUtils';
import { DatePickerModal } from '@/components/DatePickerModal';

interface DateNavigatorProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export function DateNavigator({ selectedDate, onChange }: DateNavigatorProps) {
  const parsedDate = parseDateKey(selectedDate);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => onChange(formatDateKey(subDays(parsedDate, 1)))}
        activeOpacity={0.7}
      >
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsPickerVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dateLabel}>
          {formatDisplayDateWithWeekday(selectedDate)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={() => onChange(formatDateKey(addDays(parsedDate, 1)))}
        activeOpacity={0.7}
      >
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <DatePickerModal
        visible={isPickerVisible}
        selectedDate={selectedDate}
        onSelect={date => {
          onChange(date);
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
  dateLabel: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
});
