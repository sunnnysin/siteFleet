import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatCurrency } from '@/utils/currencyUtils';
import type { Driver } from '@/types/driver';

interface DriverDetailCardProps {
  driver: Driver;
  routeLabel: string;
  monthlyFuelTaken: number;
  carriedForwardFuel: number;
  fuelBalance: number;
  onEdit: () => void;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function formatFuelAmount(litres: number): string {
  return litres === 0
    ? '0 L'
    : `${Math.abs(litres)} L ${litres > 0 ? '(credit)' : '(fuel due)'}`;
}

export function DriverDetailCard({
  driver,
  routeLabel,
  monthlyFuelTaken,
  carriedForwardFuel,
  fuelBalance,
  onEdit,
}: DriverDetailCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{driver.name}</Text>
          <Text style={styles.driverType}>
            {driver.driverType === 'permanent' ? 'Permanent' : 'Temporary'}
          </Text>
        </View>
        <View
          style={[
            styles.activeDot,
            driver.isActive ? styles.activeDotOn : styles.activeDotOff,
          ]}
        />
      </View>

      <View style={styles.divider} />

      <DetailRow label="Phone" value={driver.phone} />
      <DetailRow
        label="UPI ID"
        value={driver.upiId.length > 0 ? driver.upiId : 'Not set'}
      />
      <DetailRow
        label="Vehicle"
        value={`${driver.vehicleType} · ${driver.vehicleNumber}`}
      />
      <DetailRow label="Route" value={routeLabel} />
      <DetailRow
        label="Rate per day"
        value={formatCurrency(driver.dailyRate)}
      />
      <DetailRow
        label="Carried forward"
        value={formatFuelAmount(carriedForwardFuel)}
      />
      <DetailRow
        label="Fuel taken this month"
        value={`${monthlyFuelTaken} L`}
      />
      <DetailRow label="Fuel balance" value={formatFuelAmount(fuelBalance)} />

      <View style={styles.footer}>
        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editLabel}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  driverType: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  activeDotOn: {
    backgroundColor: colors.success,
  },
  activeDotOff: {
    backgroundColor: colors.disabled,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editLabel: {
    ...typography.label,
    color: colors.primary,
  },
});
