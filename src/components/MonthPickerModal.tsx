import { useEffect, useState } from 'react';
import { parse } from 'date-fns';
import { PickerModalShell } from '@/components/PickerModalShell';
import { PickerHeader } from '@/components/PickerHeader';
import { PickerGrid } from '@/components/PickerGrid';
import { formatMonthKey, MONTH_FORMAT } from '@/utils/dateUtils';

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

type ViewMode = 'month' | 'year';

interface MonthPickerModalProps {
  visible: boolean;
  selectedMonth: string;
  onSelect: (month: string) => void;
  onClose: () => void;
}

export function MonthPickerModal({
  visible,
  selectedMonth,
  onSelect,
  onClose,
}: MonthPickerModalProps) {
  const parsedSelected = parse(selectedMonth, MONTH_FORMAT, new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [browsingYear, setBrowsingYear] = useState(
    parsedSelected.getFullYear(),
  );
  const [yearPageStart, setYearPageStart] = useState(
    parsedSelected.getFullYear() - 5,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    const parsed = parse(selectedMonth, MONTH_FORMAT, new Date());
    setViewMode('month');
    setBrowsingYear(parsed.getFullYear());
    setYearPageStart(parsed.getFullYear() - 5);
  }, [visible, selectedMonth]);

  function handleSelectMonth(monthIndex: number): void {
    onSelect(formatMonthKey(new Date(browsingYear, monthIndex, 1)));
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
      {viewMode === 'month' ? (
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
