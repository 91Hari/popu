import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';

export default function Input({
  label,
  error,
  secureTextEntry,
  containerStyle,
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={secureTextEntry && !visible}
          autoCapitalize="none"
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setVisible(v => !v)}
            style={styles.eye}
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.muted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SIZES.md },
  label: {
    fontSize:     14,
    fontWeight:   '500',
    color:        COLORS.text,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    paddingHorizontal: SIZES.md,
  },
  input: {
    flex:       1,
    height:     50,
    fontSize:   16,
    color:      COLORS.text,
  },
  eye: { padding: 4 },
  inputError: { borderColor: COLORS.error },
  errorText: {
    fontSize:  12,
    color:     COLORS.error,
    marginTop: 4,
  },
});
