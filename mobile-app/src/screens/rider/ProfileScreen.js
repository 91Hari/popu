import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../config/theme';
import Card from '../../components/common/Card';

export default function RiderProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () =>
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{user?.name?.[0] ?? 'R'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.badge}>Rider</Text>
      </View>

      <Card>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={COLORS.primary} />
          <Text style={styles.infoText}>{user?.phone ?? 'Not set'}</Text>
        </View>
      </Card>

      <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  header:      { alignItems: 'center', paddingVertical: SIZES.xl },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.md },
  initial:     { fontSize: 36, fontWeight: '700', color: '#fff' },
  name:        { fontSize: 20, fontWeight: '700', color: COLORS.text },
  email:       { fontSize: 13, color: COLORS.muted },
  badge:       { fontSize: 12, color: COLORS.primary, fontWeight: '600', backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoText:    { fontSize: 14, color: COLORS.text },
  signOut:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: SIZES.xl },
  signOutText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
});
