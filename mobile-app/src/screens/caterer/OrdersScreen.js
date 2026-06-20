import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { COLORS, SIZES } from '../../config/theme';
import catererService from '../../services/catererService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

const TABS    = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const STATUS_COLOR = {
  pending:   '#F4B400',
  confirmed: '#2196F3',
  preparing: '#FF9800',
  ready:     '#9C27B0',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

const NEXT_STATUS = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'delivered',
};

export default function CatererOrdersScreen({ navigation }) {
  const [tab, setTab]           = useState('pending');
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await catererService.getCatererOrders({ status: tab });
      setOrders(Array.isArray(data) ? data : data?.orders ?? []);
    } catch { setOrders([]); }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [tab]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleUpdateStatus = (orderId, next) =>
    Alert.alert('Update Status', `Mark order as ${next}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: async () => {
          try {
            await catererService.updateOrderStatus(orderId, next);
            await load();
          } catch { Alert.alert('Error', 'Failed to update order status'); }
        }
      },
    ]);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TABS}
        keyExtractor={t => t}
        style={styles.tabs}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tab, tab === item && styles.tabActive]}
            onPress={() => setTab(item)}
          >
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {orders.length === 0 ? (
        <EmptyState icon="receipt-outline" title={`No ${tab} orders`} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => navigation.navigate('CatererOrderDetail', { orderId: item._id })}
            >
              <View style={styles.orderTop}>
                <Text style={styles.orderId}>#{item._id?.slice(-6).toUpperCase()}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] ?? COLORS.muted }]}>
                  <Text style={styles.badgeText}>{item.status?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.itemCount}>{item.items?.length ?? '?'} item(s) · ₹{item.totalAmount?.toFixed(2)}</Text>
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
              {NEXT_STATUS[item.status] && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleUpdateStatus(item._id, NEXT_STATUS[item.status])}
                >
                  <Text style={styles.actionText}>Mark as {NEXT_STATUS[item.status]}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  tabs:          { paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm, flexGrow: 0 },
  tab:           { paddingHorizontal: SIZES.md, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive:     { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:       { fontSize: 13, color: COLORS.text },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  list:          { padding: SIZES.lg },
  orderCard:     { backgroundColor: COLORS.surface, borderRadius: 14, padding: SIZES.md, marginBottom: SIZES.sm },
  orderTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId:       { fontSize: 15, fontWeight: '700', color: COLORS.text },
  badge:         { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:     { fontSize: 10, fontWeight: '700', color: '#fff' },
  itemCount:     { fontSize: 13, color: COLORS.muted },
  time:          { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  actionBtn:     { marginTop: SIZES.sm, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  actionText:    { color: '#fff', fontSize: 13, fontWeight: '600' },
});
