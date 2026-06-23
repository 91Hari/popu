import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';

const STATUS_COLOR = {
  pending:   '#F4B400',
  confirmed: '#2196F3',
  preparing: '#FF9800',
  ready:     '#9C27B0',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await orderService.getMasterOrders();
      setOrders(Array.isArray(data) ? data : data?.orders ?? []);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingScreen />;
  if (orders.length === 0) return (
    <EmptyState
      icon="receipt-outline"
      title="No orders yet"
      message="Your order history will appear here"
      actionLabel="Order Now"
      onAction={() => navigation.navigate('Home')}
    />
  );

  return (
    <FlatList
      style={styles.container}
      data={orders}
      keyExtractor={i => i._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}>
          <Card>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{item._id?.slice(-6).toUpperCase()}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] ?? COLORS.muted }]}>
                <Text style={styles.badgeText}>{item.status?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.items}>{item.items?.length ?? item.subOrders?.length ?? '?'} item(s)</Text>
            <View style={styles.footer}>
              <Text style={styles.total}>₹{item.totalAmount?.toFixed(2)}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </Card>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  list:         { padding: SIZES.lg },
  orderHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId:      { fontSize: 15, fontWeight: '700', color: COLORS.text },
  badge:        { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:    { fontSize: 10, fontWeight: '700', color: '#fff' },
  items:        { fontSize: 13, color: COLORS.muted },
  footer:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: SIZES.sm },
  total:        { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  date:         { fontSize: 12, color: COLORS.muted },
});
