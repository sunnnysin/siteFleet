import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface SelectOption {
  label: string;
  value: string;
  badge?: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  errorMessage?: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  errorMessage,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);
  const hasError = errorMessage !== undefined && errorMessage.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, hasError ? styles.fieldError : null]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.fieldContent}>
          <Text
            style={
              selectedOption === undefined ? styles.placeholder : styles.value
            }
          >
            {selectedOption?.label ?? placeholder}
          </Text>
          {selectedOption?.badge !== undefined ? (
            <Text style={styles.badge}>{selectedOption.badge}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
      {hasError ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {isOpen ? (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <FlatList
                data={options}
                keyExtractor={option => option.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      onChange(item.value);
                      setIsOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{item.label}</Text>
                      {item.badge !== undefined ? (
                        <Text style={styles.badge}>{item.badge}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  placeholder: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '60%',
  },
  sheetTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  fieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    ...typography.caption,
    marginLeft: 80,
    color: colors.surface,
    backgroundColor: colors.danger,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
});
