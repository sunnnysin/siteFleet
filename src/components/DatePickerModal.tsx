import { useEffect, useState } from 'react';
import { PickerModalShell } from '@/components/PickerModalShell';
import { PickerHeader } from '@/components/PickerHeader';
import { PickerGrid } from '@/components/PickerGrid';
import { DayGrid } from '@/components/DayGrid';
import { formatDateKey, parseDateKey } from '@/utils/dateUtils';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type ViewMode = 'day' | 'month' | 'year';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export function DatePickerModal({
  visible,
  selectedDate,
  onSelect,
  onClose,
}: DatePickerModalProps) {
  const parsedSelected = parseDateKey(selectedDate);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [browsingYear, setBrowsingYear] = useState(
    parsedSelected.getFullYear(),
  );
  const [browsingMonth, setBrowsingMonth] = useState(
    parsedSelected.getMonth(),
  );
  const [yearPageStart, setYearPageStart] = useState(
    parsedSelected.getFullYear() - 5,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    const parsed = parseDateKey(selectedDate);
    setViewMode('day');
    setBrowsingYear(parsed.getFullYear());
    setBrowsingMonth(parsed.getMonth());
    setYearPageStart(parsed.getFullYear() - 5);
  }, [visible, selectedDate]);

  function shiftMonth(delta: number): void {
    let nextMonth = browsingMonth + delta;
    let nextYear = browsingYear;
    if (nextMonth < 0) {
      nextMonth += 12;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth -= 12;
      nextYear += 1;
    }
    setBrowsingMonth(nextMonth);
    setBrowsingYear(nextYear);
  }

  function handleSelectDay(day: number): void {
    onSelect(formatDateKey(new Date(browsingYear, browsingMonth, day)));
  }

  function handleSelectMonth(monthIndex: number): void {
    setBrowsingMonth(monthIndex);
    setViewMode('day');
  }

  function handleSelectYear(year: number): void {
    setBrowsingYear(year);
    setViewMode('month');
  }

  const yearItems = Array.from(
    { length: 12 },
    (_, index) => yearPageStart + index,
  );

  return (
    <PickerModalShell visible={visible} onRequestClose={onClose}>
      {viewMode === 'day' ? (
        <>
          <PickerHeader
            label={`${MONTH_LABELS[browsingMonth]} ${browsingYear}`}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            onLabelPress={() => setViewMode('month')}
          />
          <DayGrid
            year={browsingYear}
            monthIndex={browsingMonth}
            selectedYear={parsedSelected.getFullYear()}
            selectedMonthIndex={parsedSelected.getMonth()}
            selectedDay={parsedSelected.getDate()}
            onSelectDay={handleSelectDay}
          />
        </>
      ) : viewMode === 'month' ? (
        <>
          <PickerHeader
            label={String(browsingYear)}
            onPrev={() => setBrowsingYear(browsingYear - 1)}
            onNext={() => setBrowsingYear(browsingYear + 1)}
            onLabelPress={() => {
              setYearPageStart(browsingYear - 5);
              setViewMode('year');
            }}
          />
          <PickerGrid
            items={MONTH_LABELS.map((label, index) => ({
              key: label,
              label,
              selected:
                browsingYear === parsedSelected.getFullYear() &&
                index === parsedSelected.getMonth(),
              onPress: () => handleSelectMonth(index),
            }))}
          />
        </>
      ) : (
        <>
          <PickerHeader
            label={`${yearPageStart} - ${yearPageStart + 11}`}
            onPrev={() => setYearPageStart(yearPageStart - 12)}
            onNext={() => setYearPageStart(yearPageStart + 12)}
          />
          <PickerGrid
            items={yearItems.map(year => ({
              key: String(year),
              label: String(year),
              selected: year === parsedSelected.getFullYear(),
              onPress: () => handleSelectYear(year),
            }))}
          />
        </>
      )}
    </PickerModalShell>
  );
}
