import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { COLORS, SIZES } from '../../config/theme';
import catererService from '../../services/catererService';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function CatererEarningsScreen() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [review, details] = await Promise.all([
        catererService.getPaymentReview(),
        catererService.getPaymentDetails(),
      ]);
      setData({ review, details });
    } catch { setData(null); }
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingScreen />;

  const r = data?.review ?? {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Earnings</Text>
        <Text style={styles.totalValue}>₹{r.totalEarnings?.toFixed(2) ?? '0.00'}</Text>
        <Text style={styles.totalSub}>Lifetime earnings</Text>
      </Card>

      <View style={styles.row}>
        <Card style={styles.halfCard}>
          <Text style={styles.cardLabel}>This Month</Text>
          <Text style={styles.cardValue}>₹{r.monthlyEarnings?.toFixed(2) ?? '--'}</Text>
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.cardLabel}>Today</Text>
          <Text style={styles.cardValue}>₹{r.dailyEarnings?.toFixed(2) ?? '--'}</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Orders</Text>
          <Text style={styles.detailValue}>{r.totalOrders ?? '--'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Platform Fee (5%)</Text>
          <Text style={styles.detailValue}>₹{r.platformFee?.toFixed(2) ?? '--'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Net Payout</Text>
          <Text style={[styles.detailValue, { color: COLORS.primary }]}>₹{r.netPayout?.toFixed(2) ?? '--'}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background, padding: SIZES.lg },
  totalCard:   { alignItems: 'center', backgroundColor: COLORS.primary, padding: SIZES.xl },
  totalLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  totalValue:  { fontSize: 36, fontWeight: '900', color: '#fff', marginTop: 4 },
  totalSub:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  row:         { flexDirection: 'row', gap: SIZES.md },
  halfCard:    { flex: 1 },
  cardLabel:   { fontSize: 12, color: COLORS.muted },
  cardValue:   { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  detailRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailLabel: { fontSize: 13, color: COLORS.muted },
  detailValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
});
