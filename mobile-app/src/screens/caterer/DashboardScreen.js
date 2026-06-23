import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, Switch, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import catererService from '../../services/catererService';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';

const STAT_CARDS = [
  { key: 'totalOrders',   label: "Today's Orders",    icon: 'receipt-outline',       color: '#2196F3' },
  { key: 'pendingOrders', label: 'Pending',            icon: 'time-outline',          color: '#FF9800' },
  { key: 'revenue',       label: "Today's Revenue",    icon: 'cash-outline',          color: '#4CAF50' },
  { key: 'rating',        label: 'Rating',             icon: 'star-outline',          color: '#F4B400' },
];

export default function CatererDashboardScreen({ navigation }) {
  const [profile, setProfile]     = useState(null);
  const [orders, setOrders]       = useState([]);
  const [isOpen, setIsOpen]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, o] = await Promise.all([
        catererService.getMyProfile(),
        catererService.getCatererOrders({ limit: 5, status: 'pending' }),
      ]);
      setProfile(p);
      setIsOpen(p?.isOpen ?? false);
      setOrders(Array.isArray(o) ? o : o?.orders ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const toggleOpen = async (val) => {
    setIsOpen(val);
    await catererService.toggleAvailability(val).catch(() => setIsOpen(!val));
  };

  if (loading) return <LoadingScreen />;

  const stats = {
    totalOrders:   profile?.todayOrders ?? '--',
    pendingOrders: orders.length,
    revenue:       profile?.todayRevenue ? `₹${profile.todayRevenue}` : '₹--',
    rating:        profile?.rating?.toFixed(1) ?? '4.5',
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Good day,</Text>
          <Text style={styles.name}>{profile?.name ?? 'Caterer'}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: isOpen ? COLORS.primary : COLORS.muted }]}>
            {isOpen ? 'Open' : 'Closed'}
          </Text>
          <Switch
            value={isOpen}
            onValueChange={toggleOpen}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {STAT_CARDS.map(s => (
          <Card key={s.key} style={styles.statCard}>
            <Ionicons name={s.icon} size={24} color={s.color} />
            <Text style={styles.statValue}>{stats[s.key]}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* Pending Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CatererOrders')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {orders.length === 0 ? (
          <Text style={styles.emptyText}>No pending orders</Text>
        ) : orders.map(o => (
          <TouchableOpacity
            key={o._id}
            style={styles.orderRow}
            onPress={() => navigation.navigate('CatererOrderDetail', { orderId: o._id })}
          >
            <Text style={styles.orderId}>#{o._id?.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderItems}>{o.items?.length ?? '?'} item(s)</Text>
            <Text style={styles.orderTotal}>₹{o.totalAmount?.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SIZES.lg },
  welcome:      { fontSize: 13, color: COLORS.muted },
  name:         { fontSize: 20, fontWeight: '700', color: COLORS.text },
  statusRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLabel:  { fontSize: 13, fontWeight: '600' },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.md },
  statCard:     { width: '45%', margin: '2.5%', alignItems: 'center' },
  statValue:    { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 6 },
  statLabel:    { fontSize: 11, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  section:      { padding: SIZES.lg },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  seeAll:       { color: COLORS.primary, fontSize: 13 },
  emptyText:    { color: COLORS.muted, textAlign: 'center', marginTop: SIZES.md },
  orderRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: 8 },
  orderId:      { fontWeight: '700', color: COLORS.text, flex: 1 },
  orderItems:   { color: COLORS.muted, fontSize: 13, flex: 1 },
  orderTotal:   { color: COLORS.primary, fontWeight: '600' },
});
