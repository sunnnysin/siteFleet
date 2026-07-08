import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import nextIcon from '@/assets/next.png';

interface PickerHeaderProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onLabelPress?: () => void;
}

export function PickerHeader({
  label,
  onPrev,
  onNext,
  onLabelPress,
}: PickerHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={onPrev}
        hitSlop={8}
        activeOpacity={0.7}
      >
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.labelButton}
        onPress={onLabelPress}
        disabled={onLabelPress === undefined}
        hitSlop={8}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{label}</Text>
        {onLabelPress !== undefined ? (
          <Image source={nextIcon} style={styles.chevron} resizeMode="contain" />
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={onNext}
        hitSlop={8}
        activeOpacity={0.7}
      >
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  arrowButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  arrow: {
    ...typography.heading,
    color: colors.primary,
  },
  labelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  chevron: {
    width: 20,
    height: 20,
    transform: [{ rotate: '90deg' }],
  },
});
