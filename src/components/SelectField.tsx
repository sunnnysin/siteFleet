import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface SelectOption {
  label: string;
  value: string;
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
      <Pressable
        style={[styles.field, hasError ? styles.fieldError : null]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={
            selectedOption === undefined ? styles.placeholder : styles.value
          }
        >
          {selectedOption?.label ?? placeholder}
        </Text>
      </Pressable>
      {hasError ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={option => option.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.optionLabel}>{item.label}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
