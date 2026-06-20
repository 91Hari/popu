import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../config/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height:         50,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.lg,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth:      2,
    borderColor:      COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize:   16,
    fontWeight: '600',
  },
  primaryText:   { color: '#fff' },
  secondaryText: { color: '#fff' },
  outlineText:   { color: COLORS.primary },
  dangerText:    { color: '#fff' },
});
