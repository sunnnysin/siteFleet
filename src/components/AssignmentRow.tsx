import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { AssignmentRowState } from '@/types/assignment';
import type { Driver } from '@/types/driver';

interface AssignmentRowProps {
  driver: Driver;
  state: AssignmentRowState;
  onChange: (state: AssignmentRowState) => void;
}

export function AssignmentRow({ driver, state, onChange }: AssignmentRowProps) {
  const isPresent = state.attendance === 'present';

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <Pressable
          style={[
            styles.attendanceToggle,
            isPresent ? styles.presentToggle : styles.absentToggle,
          ]}
          onPress={() =>
            onChange({
              ...state,
              attendance: isPresent ? 'absent' : 'present',
            })
          }
        >
          <Text style={styles.attendanceLabel}>
            {isPresent ? 'Present' : 'Absent'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.fields}>
        <TextInput
          style={styles.input}
          placeholder="Vehicle type"
          placeholderTextColor={colors.textSecondary}
          value={state.vehicleType}
          onChangeText={vehicleType => onChange({ ...state, vehicleType })}
        />
        <TextInput
          style={styles.input}
          placeholder="Vehicle number"
          placeholderTextColor={colors.textSecondary}
          value={state.vehicleNumber}
          onChangeText={vehicleNumber => onChange({ ...state, vehicleNumber })}
        />
        <TextInput
          style={styles.input}
          placeholder="Route"
          placeholderTextColor={colors.textSecondary}
          value={state.route}
          onChangeText={route => onChange({ ...state, route })}
        />
      </View>
    </View>
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
    marginBottom: spacing.sm,
  },
  driverName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  attendanceToggle: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  presentToggle: {
    backgroundColor: colors.success,
  },
  absentToggle: {
    backgroundColor: colors.disabled,
  },
  attendanceLabel: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
  },
  fields: {
    gap: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
});
