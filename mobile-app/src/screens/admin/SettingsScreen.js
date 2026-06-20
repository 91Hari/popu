import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../config/theme';
import adminService from '../../services/adminService';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function AdminSettingsScreen() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState({});
  const [form, setForm]         = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    adminService.getSettings()
      .then(s => { setSettings(s); setForm({ platformFee: s.platformFee?.toString() ?? '5', deliveryFee: s.deliveryFee?.toString() ?? '30' }); })
      .catch(() => setForm({ platformFee: '5', deliveryFee: '30' }))
      .finally(() => setLoading(false));
  }, []);

  const set = (f) => (v) => setForm(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({ platformFee: +form.platformFee, deliveryFee: +form.deliveryFee });
      Alert.alert('Saved', 'Platform settings updated successfully');
    } catch { Alert.alert('Error', 'Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Platform Settings</Text>

      <Card>
        <Text style={styles.sectionTitle}>Fees</Text>
        <Input
          label="Platform Fee (%)"
          value={form.platformFee}
          onChangeText={set('platformFee')}
          keyboardType="numeric"
        />
        <Input
          label="Default Delivery Fee (₹)"
          value={form.deliveryFee}
          onChangeText={set('deliveryFee')}
          keyboardType="numeric"
        />
        <Button title="Save Changes" onPress={handleSave} loading={saving} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Admin Actions</Text>
        <Button
          title="Sign Out"
          variant="danger"
          onPress={() =>
            Alert.alert('Sign Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: signOut },
            ])
          }
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background, padding: SIZES.lg },
  pageTitle:    { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
});
