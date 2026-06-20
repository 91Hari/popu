import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../config/theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name     = 'Full name is required';
    if (!form.username.trim())  e.username  = 'Username is required';
    if (!form.email.trim())     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)         e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await signUp(payload);
    } catch (err) {
      Alert.alert('Registration Failed', err?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (v) => setForm(f => ({ ...f, [field]: v }));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subtext}>Join the PO.PU family</Text>

        <Input label="Full Name"  placeholder="Your full name"   value={form.name}            onChangeText={set('name')}      error={errors.name} />
        <Input label="Username"   placeholder="Choose username"  value={form.username}         onChangeText={set('username')}  error={errors.username} />
        <Input label="Email"      placeholder="Email address"    value={form.email}            onChangeText={set('email')}     error={errors.email} keyboardType="email-address" />
        <Input label="Phone"      placeholder="Phone number"     value={form.phone}            onChangeText={set('phone')}     keyboardType="phone-pad" />
        <Input label="Password"   placeholder="Create password"  value={form.password}         onChangeText={set('password')}  error={errors.password} secureTextEntry />
        <Input label="Confirm"    placeholder="Repeat password"  value={form.confirmPassword}  onChangeText={set('confirmPassword')} error={errors.confirmPassword} secureTextEntry />

        {/* Role selector */}
        <Text style={styles.label}>I want to</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={form.role}
            onValueChange={set('role')}
            style={{ color: COLORS.text }}
          >
            <Picker.Item label="Order food (Customer)" value="customer" />
            <Picker.Item label="Sell food (Caterer)"   value="caterer" />
            <Picker.Item label="Deliver food (Rider)"  value="rider" />
          </Picker>
        </View>

        <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.btn} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: COLORS.background },
  container:  { padding: SIZES.lg, paddingBottom: SIZES.xl * 2 },
  heading:    { fontSize: 28, fontWeight: '700', color: COLORS.text, marginTop: SIZES.xl },
  subtext:    { fontSize: 14, color: COLORS.muted, marginBottom: SIZES.lg },
  label:      { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 6 },
  pickerWrap: {
    backgroundColor: COLORS.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     COLORS.border,
    marginBottom:    SIZES.md,
  },
  btn:        { marginTop: SIZES.sm },
  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.lg },
  footerText: { color: COLORS.muted, fontSize: 14 },
  link:       { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
