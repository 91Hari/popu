import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, Alert, TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../../config/theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import authService from '../../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>📧</Text>
        <Text style={styles.heading}>Check your inbox</Text>
        <Text style={styles.subtext}>
          We sent a password reset link to {email}. Check your spam folder if you don't see it.
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Forgot Password</Text>
        <Text style={styles.subtext}>Enter your email address and we'll send you a reset link.</Text>

        <Input
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={error}
          keyboardType="email-address"
          autoComplete="email"
        />

        <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SIZES.lg, justifyContent: 'center' },
  emoji:     { fontSize: 64, textAlign: 'center', marginBottom: SIZES.md },
  heading:   { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },
  subtext:   { fontSize: 14, color: COLORS.muted, marginBottom: SIZES.xl, lineHeight: 22 },
  backBtn:   { alignItems: 'center', marginTop: SIZES.lg },
  link:      { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
