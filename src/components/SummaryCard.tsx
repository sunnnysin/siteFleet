import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import eyeClosedIcon from '@/assets/eyeClosed.png';
import eyeOpenIcon from '@/assets/eyeOpen.png';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const MASKED_PLACEHOLDER = '••••••';

interface SummaryCardProps {
  label: string;
  value: string;
  masked?: boolean;
  onToggleMask?: () => void;
}

export function SummaryCard({
  label,
  value,
  masked = false,
  onToggleMask,
}: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{masked ? MASKED_PLACEHOLDER : value}</Text>
        {onToggleMask !== undefined ? (
          <TouchableOpacity
            onPress={onToggleMask}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Image
              source={masked ? eyeClosedIcon : eyeOpenIcon}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: radii.md,
    padding: spacing.md,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.17,
    shadowRadius: 2.54,
    elevation: 3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    ...typography.subheading,
    color: colors.primary,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    marginLeft: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
