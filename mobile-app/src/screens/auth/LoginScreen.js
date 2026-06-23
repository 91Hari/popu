import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../config/theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username or email is required';
    if (!form.password)        e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(form.username.trim(), form.password);
      // Navigation handled by RootNavigator based on auth state
    } catch (err) {
      Alert.alert('Login Failed', err?.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>PO.PU</Text>
          <Text style={styles.tagline}>Fresh food, fast delivery</Text>
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subtext}>Sign in to continue</Text>

        <Input
          label="Username or Email"
          placeholder="Enter your username or email"
          value={form.username}
          onChangeText={v => setForm(f => ({ ...f, username: v }))}
          error={errors.username}
          autoComplete="username"
          textContentType="username"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={form.password}
          onChangeText={v => setForm(f => ({ ...f, password: v }))}
          error={errors.password}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <Button title="Sign In" onPress={handleLogin} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SIZES.lg, flexGrow: 1 },
  brand: {
    alignItems:   'center',
    marginTop:    SIZES.xl * 2,
    marginBottom: SIZES.xl,
  },
  logo: {
    fontSize:    48,
    fontWeight:  '900',
    color:       COLORS.primary,
    letterSpacing: 4,
  },
  tagline:    { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  heading:    { fontSize: 28, fontWeight: '700', color: COLORS.text },
  subtext:    { fontSize: 14, color: COLORS.muted, marginBottom: SIZES.lg },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: SIZES.md },
  forgotText: { color: COLORS.primary, fontSize: 14 },
  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.lg },
  footerText: { color: COLORS.muted, fontSize: 14 },
  link:       { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
