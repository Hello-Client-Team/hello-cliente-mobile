import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  busy?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'primary', disabled, busy, icon, style }: Props) {
  const inactive = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, inactive && styles.inactive, style]}>
      {busy && <ActivityIndicator size="small" color={variant === 'secondary' ? colors.ink : '#fff'} />}
      <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>{label}</Text>
      {!busy && icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: colors.brand },
  secondary: { backgroundColor: colors.surface, borderColor: '#d5ded6' },
  danger: { backgroundColor: colors.danger },
  pressed: { opacity: 0.85 },
  inactive: { opacity: 0.5 },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
  labelSecondary: { color: colors.ink },
});
