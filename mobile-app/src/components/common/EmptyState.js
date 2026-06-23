import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import Button from './Button';

export default function EmptyState({ icon = 'alert-circle-outline', title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.muted} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         SIZES.xl,
  },
  title: {
    fontSize:   20,
    fontWeight: '700',
    color:      COLORS.text,
    marginTop:  SIZES.md,
    textAlign:  'center',
  },
  message: {
    fontSize:   14,
    color:      COLORS.muted,
    marginTop:  SIZES.sm,
    textAlign:  'center',
    lineHeight: 20,
  },
  btn: { marginTop: SIZES.lg, paddingHorizontal: SIZES.xl },
});
