import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

const TABS = ['active', 'delivered'];

export default function RiderDeliveriesScreen({ navigation }) {
  const [tab, setTab]           = useState('active');
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const status = tab === 'active' ? 'pending,confirmed,ready,out_for_delivery' : 'delivered';
      const data   = await orderService.getRiderOrders({ status });
      setItems(Array.isArray(data) ? data : data?.deliveries ?? data?.orders ?? []);
    } catch { setItems([]); }
  }, [tab]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [tab]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <EmptyState icon="bicycle-outline" title={`No ${tab} deliveries`} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: item.id })}
            >
              <View style={styles.cardTop}>
                <Text style={styles.id}>Order #{item.id}</Text>
                <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString()}</Text>
              </View>
              <Text style={styles.addr} numberOfLines={1}>
                <Ionicons name="location-outline" size={12} color={COLORS.primary} />
                {' '}{item.delivery_street ?? item.customer_name ?? 'Address unavailable'}
              </Text>
              <Text style={styles.earning}>₹{item.subtotal?.toFixed(2) ?? '--'}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  tabs:         { flexDirection: 'row', padding: SIZES.md, gap: SIZES.md },
  tab:          { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:      { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  tabTextActive:{ color: '#fff' },
  list:         { padding: SIZES.lg },
  card:         { backgroundColor: COLORS.surface, borderRadius: 14, padding: SIZES.md, marginBottom: SIZES.sm },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  id:           { fontSize: 14, fontWeight: '700', color: COLORS.text },
  time:         { fontSize: 11, color: COLORS.muted },
  addr:         { fontSize: 13, color: COLORS.muted, marginBottom: 4 },
  earning:      { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
