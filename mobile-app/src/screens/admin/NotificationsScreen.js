import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SIZES } from '../../config/theme';
import adminService from '../../services/adminService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AdminNotificationsScreen() {
  const [form, setForm] = useState({ title: '', body: '', target: 'all' });
  const [loading, setLoading] = useState(false);

  const set = (f) => (v) => setForm(p => ({ ...p, [f]: v }));

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      Alert.alert('Missing fields', 'Title and message are required');
      return;
    }
    setLoading(true);
    try {
      await adminService.sendBroadcast(form);
      Alert.alert('Sent!', `Notification sent to ${form.target} users`);
      setForm({ title: '', body: '', target: 'all' });
    } catch (err) {
      Alert.alert('Failed', err?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Send Notification</Text>
      <Text style={styles.subtitle}>Broadcast push notifications to all or specific users</Text>

      <Input
        label="Title"
        placeholder="Notification title"
        value={form.title}
        onChangeText={set('title')}
      />
      <Input
        label="Message"
        placeholder="Notification message..."
        value={form.body}
        onChangeText={set('body')}
        multiline
        style={{ height: 100 }}
      />

      <Text style={styles.label}>Target Audience</Text>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={form.target} onValueChange={set('target')} style={{ color: COLORS.text }}>
          <Picker.Item label="All Users"        value="all" />
          <Picker.Item label="Customers Only"   value="customer" />
          <Picker.Item label="Caterers Only"    value="caterer" />
          <Picker.Item label="Riders Only"      value="rider" />
        </Picker>
      </View>

      <Button title="Send Notification" onPress={handleSend} loading={loading} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  content:    { padding: SIZES.lg },
  title:      { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle:   { fontSize: 13, color: COLORS.muted, marginBottom: SIZES.lg },
  label:      { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 6 },
  pickerWrap: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: SIZES.md },
  btn:        { marginTop: SIZES.sm },
});
