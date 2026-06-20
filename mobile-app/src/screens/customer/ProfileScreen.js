import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../config/theme';
import profileService from '../../services/profileService';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';

const MENU_ITEMS = [
  { id: 'addresses',  icon: 'location-outline',     label: 'Saved Addresses',   screen: 'Addresses' },
  { id: 'orders',     icon: 'receipt-outline',       label: 'My Orders',         screen: 'Orders' },
  { id: 'payment',    icon: 'card-outline',          label: 'Payment Methods',   screen: 'PaymentMethods' },
  { id: 'password',   icon: 'lock-closed-outline',   label: 'Change Password',   screen: 'ChangePassword' },
  { id: 'support',    icon: 'headset-outline',       label: 'Help & Support',    screen: 'Support' },
  { id: 'privacy',    icon: 'shield-checkmark-outline', label: 'Privacy Policy', screen: 'Privacy' },
  { id: 'delete',     icon: 'trash-outline',         label: 'Delete Account',    screen: null, danger: true },
];

export default function ProfileScreen({ navigation }) {
  const { user, signOut, updateUser } = useAuth();
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    profileService.getProfile()
      .then(p => { setProfile(p); updateUser(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarPick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const data = await profileService.uploadAvatar(result.assets[0].uri);
        updateUser({ avatarUrl: data.avatarUrl ?? data.url });
      } catch {
        Alert.alert('Upload failed', 'Please try again');
      }
    }
  };

  const handleSignOut = () =>
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);

  const handleDeleteAccount = () =>
    Alert.alert('Delete Account', 'This action cannot be undone. All your data will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await profileService.deleteAccount('User requested deletion');
            await signOut();
          } catch { Alert.alert('Error', 'Failed to delete account. Contact support.'); }
        },
      },
    ]);

  if (loading) return <LoadingScreen />;

  const displayUser = profile ?? user;

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleAvatarPick} style={styles.avatarWrap}>
          {displayUser?.avatarUrl ? (
            <Image source={{ uri: displayUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{displayUser?.name?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
          <View style={styles.editIcon}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{displayUser?.name}</Text>
        <Text style={styles.email}>{displayUser?.email}</Text>
        <Text style={styles.role}>Customer</Text>
      </View>

      {/* Menu */}
      <Card>
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, idx > 0 && styles.menuItemBorder]}
            onPress={() => {
              if (item.id === 'delete') { handleDeleteAccount(); return; }
              if (item.screen) navigation.navigate(item.screen);
            }}
          >
            <Ionicons name={item.icon} size={20} color={item.danger ? COLORS.error : COLORS.primary} />
            <Text style={[styles.menuLabel, item.danger && { color: COLORS.error }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>PO.PU v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: COLORS.background },
  avatarSection:     { alignItems: 'center', paddingVertical: SIZES.xl },
  avatarWrap:        { position: 'relative' },
  avatar:            { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial:     { fontSize: 36, fontWeight: '700', color: '#fff' },
  editIcon:          { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.secondary, borderRadius: 12, padding: 4 },
  name:              { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: SIZES.sm },
  email:             { fontSize: 13, color: COLORS.muted },
  role:              { fontSize: 12, color: COLORS.primary, fontWeight: '600', backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  menuItem:          { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md },
  menuItemBorder:    { borderTopWidth: 1, borderTopColor: COLORS.border },
  menuLabel:         { flex: 1, fontSize: 14, color: COLORS.text, marginLeft: 12 },
  signOutBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: SIZES.lg },
  signOutText:       { fontSize: 15, color: COLORS.error, fontWeight: '600', marginLeft: 8 },
  version:           { textAlign: 'center', color: COLORS.muted, fontSize: 11, marginBottom: SIZES.xl },
});
