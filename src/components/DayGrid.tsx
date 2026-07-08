import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAYS_PER_WEEK = 7;

interface DayGridProps {
  year: number;
  monthIndex: number;
  selectedYear: number | null;
  selectedMonthIndex: number | null;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

export function DayGrid({
  year,
  monthIndex,
  selectedYear,
  selectedMonthIndex,
  selectedDay,
  onSelectDay,
}: DayGridProps) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingBlanks = new Date(year, monthIndex, 1).getDay();
  const cells: Array<number | null> = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % DAYS_PER_WEEK !== 0) {
    cells.push(null);
  }
  const rows: Array<Array<number | null>> = [];
  for (let index = 0; index < cells.length; index += DAYS_PER_WEEK) {
    rows.push(cells.slice(index, index + DAYS_PER_WEEK));
  }
  const isSelectedMonth =
    selectedYear === year && selectedMonthIndex === monthIndex;

  return (
    <View>
      <View style={[styles.row, styles.weekdayRow]}>
        {WEEKDAY_LABELS.map(label => (
          <Text key={label} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((day, columnIndex) =>
            day === null ? (
              <View key={`blank-${rowIndex}-${columnIndex}`} style={styles.cell} />
            ) : (
              <TouchableOpacity
                key={day}
                style={styles.cell}
                onPress={() => onSelectDay(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.cellLabel,
                    isSelectedMonth &&
                      day === selectedDay &&
                      styles.cellLabelSelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  weekdayRow: {
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    ...typography.body,
    color: colors.textPrimary,
    width: 32,
    height: 32,
    lineHeight: 32,
    textAlign: 'center',
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  cellLabelSelected: {
    backgroundColor: colors.primary,
    color: colors.surface,
    fontWeight: '600',
  },
});
