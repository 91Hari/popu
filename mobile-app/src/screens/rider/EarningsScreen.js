import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function RiderEarningsScreen() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await orderService.getRiderOrders({ status: 'delivered' });
      setDeliveries(Array.isArray(data) ? data : data?.deliveries ?? []);
    } catch { setDeliveries([]); }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingScreen />;

  const totalEarnings    = deliveries.reduce((s, d) => s + (d.deliveryFee ?? 0), 0);
  const todayDeliveries  = deliveries.filter(d => new Date(d.updatedAt ?? d.createdAt).toDateString() === new Date().toDateString());
  const todayEarnings    = todayDeliveries.reduce((s, d) => s + (d.deliveryFee ?? 0), 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Earnings</Text>
        <Text style={styles.totalValue}>₹{totalEarnings.toFixed(2)}</Text>
        <Text style={styles.totalSub}>All completed deliveries</Text>
      </Card>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={styles.cardLabel}>Today</Text>
          <Text style={styles.cardValue}>₹{todayEarnings.toFixed(2)}</Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.cardLabel}>Deliveries</Text>
          <Text style={styles.cardValue}>{deliveries.length}</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.historyTitle}>Recent Deliveries</Text>
        {deliveries.slice(0, 10).map(d => (
          <View key={d._id} style={styles.histRow}>
            <Text style={styles.histId}>#{d._id?.slice(-6).toUpperCase()}</Text>
            <Text style={styles.histDate}>{new Date(d.updatedAt ?? d.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.histAmt}>₹{d.deliveryFee ?? '--'}</Text>
          </View>
        ))}
        {deliveries.length === 0 && <Text style={styles.empty}>No completed deliveries yet</Text>}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background, padding: SIZES.lg },
  totalCard:    { alignItems: 'center', backgroundColor: COLORS.primary, padding: SIZES.xl },
  totalLabel:   { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  totalValue:   { fontSize: 36, fontWeight: '900', color: '#fff', marginTop: 4 },
  totalSub:     { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  row:          { flexDirection: 'row', gap: SIZES.md },
  halfCard:     { flex: 1 },
  cardLabel:    { fontSize: 12, color: COLORS.muted },
  cardValue:    { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  historyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  histRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  histId:       { fontSize: 13, color: COLORS.text, flex: 1 },
  histDate:     { fontSize: 11, color: COLORS.muted, flex: 1, textAlign: 'center' },
  histAmt:      { fontSize: 13, fontWeight: '600', color: COLORS.primary, flex: 1, textAlign: 'right' },
  empty:        { textAlign: 'center', color: COLORS.muted, marginTop: SIZES.md },
});
