import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import catererService from '../../services/catererService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

export default function CatererListScreen({ navigation }) {
  const [caterers, setCaterers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await catererService.getAllCaterers();
      setCaterers(Array.isArray(data) ? data : data?.caterers ?? []);
    } catch { setCaterers([]); }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingScreen />;
  if (caterers.length === 0) return <EmptyState icon="storefront-outline" title="No caterers found" message="Check back later" />;

  return (
    <FlatList
      style={styles.container}
      data={caterers}
      keyExtractor={i => i._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('CatererDetail', { catererId: item._id })}
        >
          <View style={styles.avatar}>
            <Text style={styles.initial}>{item.name?.[0]?.toUpperCase() ?? 'C'}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.cuisine} numberOfLines={1}>{item.cuisine ?? item.description ?? ''}</Text>
            <View style={styles.meta}>
              <Ionicons name="star" size={12} color={COLORS.secondary} />
              <Text style={styles.rating}>{item.rating?.toFixed(1) ?? '4.5'}</Text>
              {item.isOpen !== undefined && (
                <View style={[styles.badge, { backgroundColor: item.isOpen ? COLORS.primary : COLORS.muted }]}>
                  <Text style={styles.badgeText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
                </View>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list:      { padding: SIZES.lg },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 16, padding: SIZES.md, marginBottom: SIZES.sm },
  avatar:    { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  initial:   { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  info:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cuisine:   { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  meta:      { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rating:    { fontSize: 12, color: COLORS.text, marginLeft: 3, marginRight: 8 },
  badge:     { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
});
