import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, getDaysInMonth } from 'date-fns';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EmptyState } from '@/components/EmptyState';
import { MonthNavigator } from '@/components/MonthNavigator';
import { Shimmer } from '@/components/Shimmer';
import {
  computeGoraulSummaryTotals,
  fetchGoraulSummary,
  saveGoraulSummary,
} from '@/services/goraulSummaryService';
import { shareGoraulSummaryReport } from '@/services/goraulSummaryReportService';
import {
  currentMonthKey,
  formatDateKey,
  formatDisplayDateWithWeekdayNoYear,
  parseMonthKey,
} from '@/utils/dateUtils';
import type { GoraulSummary, GoraulSummaryEntry } from '@/types/goraulSummary';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface RowInput {
  ace: string;
  bolero: string;
}

function buildDatesForMonth(monthKey: string): string[] {
  const monthStart = parseMonthKey(monthKey);
  const daysInMonth = getDaysInMonth(monthStart);
  return Array.from({ length: daysInMonth }, (_, index) =>
    formatDateKey(
      new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1),
    ),
  );
}

function filterNonZeroEntries(
  entries: GoraulSummaryEntry[],
): GoraulSummaryEntry[] {
  return entries.filter(entry => entry.ace > 0 || entry.bolero > 0);
}

function buildRowInputs(
  dates: string[],
  entries: GoraulSummaryEntry[],
): Record<string, RowInput> {
  const entryByDate = new Map(entries.map(entry => [entry.date, entry]));
  return Object.fromEntries(
    dates.map(date => {
      const entry = entryByDate.get(date);
      return [
        date,
        {
          ace: entry !== undefined ? String(entry.ace) : '',
          bolero: entry !== undefined ? String(entry.bolero) : '',
        },
      ];
    }),
  );
}

type ViewMode = 'prompt' | 'form' | 'saved';

export function GoraulSummaryScreen() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [savedSummary, setSavedSummary] = useState<GoraulSummary | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('prompt');
  const [rowInputs, setRowInputs] = useState<Record<string, RowInput>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(
    null,
  );

  const dates = useMemo(
    () => buildDatesForMonth(selectedMonth),
    [selectedMonth],
  );

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const focusedInputKeyRef = useRef<string | null>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  const scrollFocusedInputIntoView = useCallback(() => {
    const key = focusedInputKeyRef.current;
    const input = key !== null ? inputRefs.current[key] : null;
    if (input === null || input === undefined) {
      return;
    }
    input.measureInWindow((_x, y, _width, height) => {
      const keyboardHeight = keyboardHeightRef.current;
      const visibleBottom = Dimensions.get('window').height - keyboardHeight;
      const overlap = y + height - visibleBottom;
      if (overlap > 0) {
        scrollRef.current?.scrollTo({
          y: scrollOffsetRef.current + overlap + spacing.lg,
          animated: true,
        });
      }
    });
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
      keyboardHeightRef.current = event.endCoordinates.height;
      setKeyboardPadding(event.endCoordinates.height);
      // The extra bottom padding needs to be laid out before the scroll
      // target's position is measured, otherwise the ScrollView caps the
      // scroll at its old (pre-keyboard) content height and can't move the
      // focused row above the keyboard.
      setTimeout(scrollFocusedInputIntoView, 100);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardHeightRef.current = 0;
      setKeyboardPadding(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollFocusedInputIntoView]);

  function handleInputFocus(key: string): void {
    focusedInputKeyRef.current = key;
    scrollFocusedInputIntoView();
  }

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const summary = await fetchGoraulSummary(selectedMonth);
      setSavedSummary(summary);
      setViewMode(summary === null ? 'prompt' : 'saved');
      setRowInputs(buildRowInputs(dates, summary?.entries ?? []));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load summary.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, dates]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function parseRowInputs(): GoraulSummaryEntry[] | null {
    const entries: GoraulSummaryEntry[] = [];
    for (const date of dates) {
      const row = rowInputs[date] ?? { ace: '', bolero: '' };
      const ace = row.ace.trim().length > 0 ? Number(row.ace) : 0;
      const bolero = row.bolero.trim().length > 0 ? Number(row.bolero) : 0;
      if (
        !Number.isFinite(ace) ||
        ace < 0 ||
        !Number.isFinite(bolero) ||
        bolero < 0
      ) {
        return null;
      }
      entries.push({ date, ace, bolero });
    }
    return entries;
  }

  async function handleSave(): Promise<void> {
    const entries = parseRowInputs();
    if (entries === null) {
      setSaveErrorMessage('Enter a valid, non-negative number for each cell.');
      return;
    }

    setIsSaving(true);
    setSaveErrorMessage(null);
    try {
      await saveGoraulSummary(selectedMonth, entries);
      await loadData();
    } catch (error) {
      setSaveErrorMessage(
        error instanceof Error ? error.message : 'Failed to save summary.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExport(): Promise<void> {
    const entries = parseRowInputs();
    if (entries === null) {
      setExportErrorMessage(
        'Enter a valid, non-negative number for each cell.',
      );
      return;
    }

    setIsExporting(true);
    setExportErrorMessage(null);
    try {
      await shareGoraulSummaryReport(
        selectedMonth,
        filterNonZeroEntries(entries),
      );
    } catch (error) {
      setExportErrorMessage(
        error instanceof Error ? error.message : 'Failed to export summary.',
      );
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.monthNavigator}>
            <MonthNavigator
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
            />
          </View>

          <View style={styles.cardContainer}>
            <View style={styles.tableHeaderRow}>
              <Text
                style={[styles.tableCell, styles.dateCell, styles.headerText]}
              >
                Date
              </Text>
              <Text
                style={[styles.tableCell, styles.headerText, styles.center]}
              >
                ACE
              </Text>
              <Text
                style={[styles.tableCell, styles.headerText, styles.center]}
              >
                Bolero/PickUp
              </Text>
            </View>
            {Array.from({ length: 6 }, (_, index) => (
              <View
                key={index}
                style={[styles.tableRow, index === 5 && styles.tableRowLast]}
              >
                <Shimmer style={styles.dateCellSkeleton} />
                <Shimmer style={styles.cellSkeleton} />
                <Shimmer style={styles.cellSkeleton} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (errorMessage !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Couldn't load summary"
          message={errorMessage}
          variant="error"
          onRetry={() => void loadData()}
        />
      </SafeAreaView>
    );
  }

  const savedTotals = computeGoraulSummaryTotals(savedSummary?.entries ?? []);
  const savedDisplayEntries = filterNonZeroEntries(savedSummary?.entries ?? []);
  const monthLabel = format(parseMonthKey(selectedMonth), 'MMMM');

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 10 + keyboardPadding },
        ]}
        onScroll={event => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.monthNavigator}>
          <MonthNavigator
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />
        </View>

        {viewMode === 'prompt' ? (
          <EmptyState
            title="No summary yet"
            message={`Add the ${monthLabel} summary to record daily ACE / Bolero-PickUp counts.`}
            retryLabel={`Add ${monthLabel} Summary`}
            onRetry={() => setViewMode('form')}
          />
        ) : viewMode === 'form' ? (
          <>
            <View style={styles.cardContainer}>
              <View style={styles.tableHeaderRow}>
                <Text
                  style={[styles.tableCell, styles.dateCell, styles.headerText]}
                >
                  Date
                </Text>
                <Text
                  style={[styles.tableCell, styles.headerText, styles.center]}
                >
                  ACE
                </Text>
                <Text
                  style={[styles.tableCell, styles.headerText, styles.center]}
                >
                  Bolero/PickUp
                </Text>
              </View>
              {dates.map((date, index) => (
                <View
                  key={date}
                  style={[
                    styles.tableRow,
                    index === dates.length - 1 && styles.tableRowLast,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.dateCell]}>
                    {formatDisplayDateWithWeekdayNoYear(date)}
                  </Text>
                  <TextInput
                    ref={ref => {
                      inputRefs.current[`${date}-ace`] = ref;
                    }}
                    style={[styles.tableCell, styles.inputCell]}
                    keyboardType="number-pad"
                    placeholder="00"
                    value={rowInputs[date]?.ace ?? ''}
                    onFocus={() => handleInputFocus(`${date}-ace`)}
                    onChangeText={value =>
                      setRowInputs(current => ({
                        ...current,
                        [date]: {
                          ...current[date],
                          ace: value,
                          bolero: current[date]?.bolero ?? '',
                        },
                      }))
                    }
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TextInput
                    ref={ref => {
                      inputRefs.current[`${date}-bolero`] = ref;
                    }}
                    style={[styles.tableCell, styles.inputCell]}
                    keyboardType="number-pad"
                    placeholder="00"
                    value={rowInputs[date]?.bolero ?? ''}
                    onFocus={() => handleInputFocus(`${date}-bolero`)}
                    onChangeText={value =>
                      setRowInputs(current => ({
                        ...current,
                        [date]: {
                          ...current[date],
                          ace: current[date]?.ace ?? '',
                          bolero: value,
                        },
                      }))
                    }
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              ))}
            </View>

            {saveErrorMessage !== null ? (
              <Text style={styles.errorText}>{saveErrorMessage}</Text>
            ) : null}
            <PrimaryButton
              label="Save summary"
              onPress={() => void handleSave()}
              isLoading={isSaving}
            />
            {exportErrorMessage !== null ? (
              <Text style={styles.errorText}>{exportErrorMessage}</Text>
            ) : null}
            <View style={styles.secondaryButton}>
              <PrimaryButton
                label="Generate report"
                onPress={() => void handleExport()}
                variant="secondary"
                isLoading={isExporting}
              />
            </View>
          </>
        ) : (
          <>
            <PrimaryButton
              label="Edit"
              onPress={() => setViewMode('form')}
              variant="secondary"
            />

            <View style={[styles.cardContainer, styles.savedCard]}>
              <View style={styles.tableHeaderRow}>
                <Text
                  style={[styles.tableCell, styles.dateCell, styles.headerText]}
                >
                  Date
                </Text>
                <Text
                  style={[styles.tableCell, styles.headerText, styles.center]}
                >
                  ACE
                </Text>
                <Text
                  style={[styles.tableCell, styles.headerText, styles.center]}
                >
                  Bolero/PickUp
                </Text>
                <Text
                  style={[styles.tableCell, styles.headerText, styles.center]}
                >
                  Total
                </Text>
              </View>
              {savedDisplayEntries.map((entry, index) => (
                <View
                  key={entry.date}
                  style={[
                    styles.tableRow,
                    index === savedDisplayEntries.length - 1 &&
                      styles.tableRowLast,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.dateCell]}>
                    {formatDisplayDateWithWeekdayNoYear(entry.date)}
                  </Text>
                  <Text style={[styles.tableCell, styles.center]}>
                    {entry.ace}
                  </Text>
                  <Text style={[styles.tableCell, styles.center]}>
                    {entry.bolero}
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.center, styles.totalText]}
                  >
                    {entry.ace + entry.bolero}
                  </Text>
                </View>
              ))}
              <View style={styles.tableFooterRow}>
                <Text
                  style={[styles.tableCell, styles.dateCell, styles.totalText]}
                >
                  Grand total
                </Text>
                <Text
                  style={[styles.tableCell, styles.center, styles.totalText]}
                >
                  {savedTotals.ace}
                </Text>
                <Text
                  style={[styles.tableCell, styles.center, styles.totalText]}
                >
                  {savedTotals.bolero}
                </Text>
                <Text
                  style={[styles.tableCell, styles.center, styles.totalText]}
                >
                  {savedTotals.total}
                </Text>
              </View>
            </View>

            {exportErrorMessage !== null ? (
              <Text style={styles.errorText}>{exportErrorMessage}</Text>
            ) : null}
            <View style={styles.secondaryButton}>
              <PrimaryButton
                label="Generate report"
                onPress={() => void handleExport()}
                isLoading={isExporting}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 10,
  },
  monthNavigator: {
    marginHorizontal: -spacing.lg,
  },
  cardContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  savedCard: {
    marginTop: spacing.lg,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableFooterRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  tableCell: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    padding: spacing.sm,
  },
  inputCell: {
    textAlign: 'center',
  },
  dateCell: {
    flex: 1.4,
  },
  dateCellSkeleton: {
    flex: 1.4,
    height: 15,
    margin: spacing.sm,
  },
  cellSkeleton: {
    flex: 1,
    height: 15,
    margin: spacing.sm,
    alignSelf: 'center',
  },
  headerText: {
    fontWeight: '600',
  },
  totalText: {
    fontWeight: '700',
  },
  center: {
    textAlign: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});
