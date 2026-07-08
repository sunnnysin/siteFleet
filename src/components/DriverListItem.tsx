import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import phoneIcon from '@/assets/phone.png';
import type { Driver } from '@/types/driver';

interface DriverListItemProps {
  driver: Driver;
  routeName: string;
  fuelBalance: number;
  onPress: () => void;
  onToggleActive: () => void;
}

export function DriverListItem({
  driver,
  routeName,
  fuelBalance,
  onPress,
  onToggleActive,
}: DriverListItemProps) {
  function handleCall(): void {
    void Linking.openURL(`tel:${driver.phone}`);
  }

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      onLongPress={onToggleActive}
      activeOpacity={0.7}
    >
      <View style={styles.details}>
        <Text style={styles.name}>{driver.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaInline}>
            {driver.vehicleType} · {driver.vehicleNumber}
          </Text>
          <Text style={styles.separatorDot}>●</Text>
          <Text style={styles.metaInline}>{routeName}</Text>
          {fuelBalance > 0 ? (
            <>
              <Text style={styles.separatorDot}>●</Text>
              <Text style={styles.fuelBalance}>{fuelBalance} L</Text>
            </>
          ) : null}
        </View>
      </View>
      <TouchableOpacity onPress={handleCall} hitSlop={8} activeOpacity={0.7}>
        <Image
          source={phoneIcon}
          style={styles.callIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  details: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaInline: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separatorDot: {
    color: colors.primary,
    fontSize: 8,
    marginHorizontal: spacing.md,
  },
  fuelBalance: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  callIcon: {
    width: 36,
    height: 36,
    marginLeft: spacing.md,
  },
});
