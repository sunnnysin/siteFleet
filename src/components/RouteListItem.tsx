import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import deleteIcon from '@/assets/delete.png';
import { formatRouteDescription } from '@/utils/textUtils';
import type { Route } from '@/types/route';

interface RouteListItemProps {
  route: Route;
  onPress: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function RouteListItem({
  route,
  onPress,
  onDelete,
  isDeleting,
}: RouteListItemProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.details}>
        <Text style={styles.name}>{route.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaInline}>
            {formatRouteDescription(route.description)}
          </Text>
          <Text style={styles.separatorDot}>●</Text>
          <Text style={styles.metaInline}>{route.fuelLitres ?? 0} L</Text>
        </View>
      </View>
      <TouchableOpacity
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
  deleteIcon: {
    width: 36,
    height: 36,
    marginLeft: spacing.md,
  },
});
