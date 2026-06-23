import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import profileService from '../../services/profileService';
import LoadingScreen from '../../components/common/LoadingScreen';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export default function AddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    try {
      const data = await profileService.getAddresses();
      setAddresses(Array.isArray(data) ? data : data?.addresses ?? []);
    } catch { setAddresses([]); }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleDelete = (id) =>
    Alert.alert('Delete Address', 'Remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await profileService.deleteAddress(id).catch(() => {});
          setAddresses(prev => prev.filter(a => a._id !== id));
        }
      },
    ]);

  const handleSetDefault = async (id) => {
    await profileService.setDefaultAddress(id).catch(() => {});
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === id })));
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {addresses.length === 0
        ? <EmptyState icon="location-outline" title="No addresses saved" />
        : (
          <FlatList
            data={addresses}
            keyExtractor={a => a._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Ionicons name="location" size={22} color={COLORS.primary} />
                <View style={styles.info}>
                  <Text style={styles.label}>{item.label ?? 'Home'} {item.isDefault && '⭐'}</Text>
                  <Text style={styles.address}>{item.street}, {item.city}, {item.state} - {item.pincode}</Text>
                </View>
                <View style={styles.actions}>
                  {!item.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefault(item._id)} style={styles.iconBtn}>
                      <Ionicons name="star-outline" size={18} color={COLORS.muted} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )
      }
      <View style={styles.footer}>
        <Button title="Add New Address" onPress={() => navigation.navigate('AddAddress')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list:      { padding: SIZES.lg },
  card:      { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.surface, borderRadius: 14, padding: SIZES.md, marginBottom: SIZES.sm },
  info:      { flex: 1, marginLeft: 10 },
  label:     { fontSize: 14, fontWeight: '700', color: COLORS.text },
  address:   { fontSize: 12, color: COLORS.muted, marginTop: 2, lineHeight: 18 },
  actions:   { flexDirection: 'row' },
  iconBtn:   { padding: 4, marginLeft: 4 },
  footer:    { padding: SIZES.lg },
});
