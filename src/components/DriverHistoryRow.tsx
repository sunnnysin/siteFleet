import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDisplayDate } from '@/utils/dateUtils';
import type { DailyEntry } from '@/types/dailyEntry';

interface DriverHistoryRowProps {
  entry: DailyEntry;
}

export function DriverHistoryRow({ entry }: DriverHistoryRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.dateColumn}>
        <Text style={styles.date}>{formatDisplayDate(entry.date)}</Text>
        <Text style={styles.route}>{entry.route}</Text>
      </View>
      <Text
        style={[
          styles.attendance,
          entry.attendance === 'present'
            ? styles.presentText
            : styles.absentText,
        ]}
      >
        {entry.attendance === 'present' ? 'Present' : 'Absent'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  dateColumn: {
    flex: 1.4,
  },
  date: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  route: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  attendance: {
    ...typography.caption,
    flex: 1,
    textAlign: 'right',
  },
  presentText: {
    color: colors.success,
  },
  absentText: {
    color: colors.disabled,
  },
});
