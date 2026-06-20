import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../config/theme';
import catererService from '../../services/catererService';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function CatererProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    catererService.getMyProfile()
      .then(p => { setProfile(p); setForm({ name: p.name, description: p.description ?? '', cuisine: p.cuisine ?? '' }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await catererService.updateMyProfile(form);
      setProfile(updated);
      setEditing(false);
    } catch { Alert.alert('Error', 'Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen />;

  const set = (f) => (v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{profile?.name?.[0] ?? 'C'}</Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.badge}>Caterer</Text>
      </View>

      {editing ? (
        <Card>
          <Input label="Business Name"  value={form.name}        onChangeText={set('name')} />
          <Input label="Description"    value={form.description} onChangeText={set('description')} multiline />
          <Input label="Cuisine Type"   value={form.cuisine}     onChangeText={set('cuisine')} />
          <View style={styles.editActions}>
            <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={styles.halfBtn} />
            <Button title="Save"   onPress={handleSave} loading={saving} style={styles.halfBtn} />
          </View>
        </Card>
      ) : (
        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>{profile?.description ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cuisine</Text>
            <Text style={styles.infoValue}>{profile?.cuisine ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rating</Text>
            <Text style={styles.infoValue}>⭐ {profile?.rating?.toFixed(1) ?? '—'}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>
      )}

      <TouchableOpacity
        style={styles.signOut}
        onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ])}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  header:      { alignItems: 'center', paddingVertical: SIZES.xl },
  avatar:      { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.md },
  initial:     { fontSize: 36, fontWeight: '700', color: '#fff' },
  name:        { fontSize: 20, fontWeight: '700', color: COLORS.text },
  badge:       { backgroundColor: COLORS.accent, color: COLORS.primary, fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  infoRow:     { marginBottom: SIZES.md },
  infoLabel:   { fontSize: 12, color: COLORS.muted },
  infoValue:   { fontSize: 14, color: COLORS.text, marginTop: 2 },
  editBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: SIZES.sm },
  editText:    { color: COLORS.primary, fontSize: 14 },
  editActions: { flexDirection: 'row', gap: SIZES.md, marginTop: SIZES.md },
  halfBtn:     { flex: 1 },
  signOut:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: SIZES.xl },
  signOutText: { color: COLORS.error, fontSize: 15, fontWeight: '600' },
});
