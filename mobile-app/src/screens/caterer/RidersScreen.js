import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import catererService from '../../services/catererService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

export default function CatererRidersScreen({ navigation }) {
  const [riders, setRiders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await catererService.getCatererRiders();
      setRiders(Array.isArray(data) ? data : data?.riders ?? []);
    } catch { setRiders([]); }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleDelete = (id) =>
    Alert.alert('Remove Rider', 'Remove this rider?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          await catererService.deleteRider(id).catch(() => {});
          setRiders(prev => prev.filter(r => r._id !== id));
        }
      },
    ]);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {riders.length === 0 ? (
        <EmptyState
          icon="bicycle-outline"
          title="No riders assigned"
          message="Add riders to handle your deliveries"
          actionLabel="Add Rider"
          onAction={() => navigation.navigate('AddRider')}
        />
      ) : (
        <FlatList
          data={riders}
          keyExtractor={r => r._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.initial}>{item.name?.[0] ?? 'R'}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.del}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <View style={styles.fab}>
        <TouchableOpacity style={styles.fabBtn} onPress={() => navigation.navigate('AddRider')}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list:      { padding: SIZES.lg, paddingBottom: 100 },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: SIZES.md, marginBottom: SIZES.sm },
  avatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  initial:   { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  info:      { flex: 1 },
  name:      { fontSize: 14, fontWeight: '600', color: COLORS.text },
  phone:     { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  del:       { padding: 4 },
  fab:       { position: 'absolute', bottom: SIZES.xl, right: SIZES.lg },
  fabBtn:    { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
});
