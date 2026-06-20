import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { COLORS, SIZES } from '../../config/theme';
import adminService from '../../services/adminService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

const STATUS_COLOR = {
  pending:   '#F4B400',
  confirmed: '#2196F3',
  preparing: '#FF9800',
  ready:     '#9C27B0',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

export default function AdminOrdersScreen() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage]         = useState(1);

  const load = useCallback(async (p = 1) => {
    try {
      const data = await adminService.getOrders({ page: p, limit: 20, sort: '-createdAt' });
      const list = Array.isArray(data) ? data : data?.orders ?? [];
      setOrders(p === 1 ? list : prev => [...prev, ...list]);
    } catch { if (p === 1) setOrders([]); }
  }, []);

  useEffect(() => { setLoading(true); load(1).finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); setPage(1); await load(1); setRefreshing(false); };

  if (loading) return <LoadingScreen />;
  if (orders.length === 0) return <EmptyState icon="receipt-outline" title="No orders found" />;

  return (
    <FlatList
      style={styles.container}
      data={orders}
      keyExtractor={o => o._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.id}>#{item._id?.slice(-6).toUpperCase()}</Text>
            <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] ?? COLORS.muted }]}>
              <Text style={styles.badgeText}>{item.status?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.detail}>{item.customer?.name ?? item.userId ?? 'Unknown'}</Text>
            <Text style={styles.amount}>₹{item.totalAmount?.toFixed(2)}</Text>
          </View>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      )}
      onEndReached={() => { setPage(p => { load(p + 1); return p + 1; }); }}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  list:       { padding: SIZES.md },
  card:       { backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: 8 },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  id:         { fontSize: 14, fontWeight: '700', color: COLORS.text },
  badge:      { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:  { fontSize: 10, fontWeight: '700', color: '#fff' },
  detail:     { fontSize: 13, color: COLORS.muted },
  amount:     { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  date:       { fontSize: 11, color: COLORS.muted },
});
