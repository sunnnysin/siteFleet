import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DriverTypeBadge } from '@/components/DriverTypeBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import {
  computeEffectiveDriverPay,
  computeEffectiveFuelCost,
  inferDriverTypeFromEntry,
} from '@/services/dailyEntryService';
import deleteIcon from '@/assets/delete.png';
import type { DailyEntry } from '@/types/dailyEntry';

interface DailyEntryRowProps {
  entry: DailyEntry;
  onPress: () => void;
  onSettleNow: () => void;
  isSettling: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

export function DailyEntryRow({
  entry,
  onPress,
  onSettleNow,
  isSettling,
  onDelete,
  isDeleting,
}: DailyEntryRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.route}>{entry.route}</Text>
        <View style={styles.headerBadges}>
          <DriverTypeBadge driverType={inferDriverTypeFromEntry(entry)} />
          <StatusBadge status={entry.paymentStatus} />
        </View>
      </View>
      <Text style={styles.driverName}>{entry.driverName}</Text>
      <Text style={styles.meta}>
        {entry.vehicleType} · {entry.vehicleNumber}
      </Text>
      <View style={styles.attendanceRow}>
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
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          disabled={isDeleting}
          hitSlop={8}
          activeOpacity={0.7}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <Image
              source={deleteIcon}
              style={styles.deleteIcon}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.figuresRow}>
        <Text style={styles.figure}>
          Fuel: {entry.fuelLitres} L (
          {formatCurrency(computeEffectiveFuelCost(entry))})
        </Text>
        <Text style={styles.figure}>
          Pay: {formatCurrency(computeEffectiveDriverPay(entry))}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.settlementLabel}>
          {entry.settlementType === 'sameDay' ? 'Same-day' : 'Monthly'}
        </Text>
        {entry.settlementType === 'sameDay' &&
        entry.paymentStatus === 'unpaid' ? (
          <TouchableOpacity
            style={styles.settleButton}
            onPress={onSettleNow}
            disabled={isSettling}
            activeOpacity={0.7}
          >
            <Text style={styles.settleLabel}>
              {isSettling ? 'Opening UPI…' : 'Settle now'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  route: {
    ...typography.subheading,
    color: colors.primary,
  },
  driverName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  attendance: {
    ...typography.label,
  },
  presentText: {
    color: colors.success,
  },
  absentText: {
    color: colors.disabled,
  },
  figuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  figure: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: -20,
  },
  deleteIcon: {
    width: 30,
    height: 30,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  settlementLabel: {
    ...typography.label,
    color: colors.primary,
  },
  settleButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  settleLabel: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
});
