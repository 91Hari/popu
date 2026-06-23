import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import adminService from '../../services/adminService';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';

const STAT_CARDS = [
  { key: 'totalOrders',     label: 'Total Orders',    icon: 'receipt-outline',       color: '#2196F3' },
  { key: 'totalCustomers',  label: 'Customers',        icon: 'people-outline',        color: '#9C27B0' },
  { key: 'totalCaterers',   label: 'Caterers',         icon: 'storefront-outline',    color: '#FF9800' },
  { key: 'totalRevenue',    label: 'Revenue',          icon: 'cash-outline',          color: '#4CAF50' },
];

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats]           = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, o] = await Promise.all([
        adminService.getDashboard(),
        adminService.getOrders({ limit: 5, sort: '-createdAt' }),
      ]);
      setStats(d);
      setRecentOrders(Array.isArray(o) ? o : o?.orders ?? []);
    } catch {}
  }, []);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        {STAT_CARDS.map(s => (
          <Card key={s.key} style={styles.statCard}>
            <Ionicons name={s.icon} size={24} color={s.color} />
            <Text style={styles.statValue}>
              {s.key === 'totalRevenue' ? `₹${(stats[s.key] ?? 0).toLocaleString()}` : stats[s.key] ?? '--'}
            </Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        {[
          { label: 'Manage Users',    icon: 'people',          screen: 'AdminCustomers' },
          { label: 'Caterers',        icon: 'storefront',      screen: 'AdminCaterers' },
          { label: 'All Orders',      icon: 'receipt',         screen: 'AdminOrders' },
          { label: 'Payments',        icon: 'card',            screen: 'AdminPayments' },
          { label: 'Notifications',   icon: 'notifications',   screen: 'AdminNotifications' },
          { label: 'Settings',        icon: 'settings',        screen: 'AdminSettings' },
        ].map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.quickLink}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={`${item.icon}-outline`} size={22} color={COLORS.primary} />
            <Text style={styles.quickLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.map(o => (
          <View key={o._id} style={styles.orderRow}>
            <Text style={styles.orderId}>#{o._id?.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderStatus}>{o.status}</Text>
            <Text style={styles.orderAmt}>₹{o.totalAmount?.toFixed(2)}</Text>
          </View>
        ))}
        {recentOrders.length === 0 && <Text style={styles.empty}>No recent orders</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  header:      { padding: SIZES.lg },
  title:       { fontSize: 24, fontWeight: '700', color: COLORS.text },
  date:        { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.md },
  statCard:    { width: '45%', margin: '2.5%', alignItems: 'center' },
  statValue:   { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 6 },
  statLabel:   { fontSize: 11, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  quickLinks:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.md, marginTop: SIZES.sm },
  quickLink:   { width: '30%', margin: '1.5%', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, alignItems: 'center' },
  quickLabel:  { fontSize: 11, color: COLORS.text, marginTop: 6, textAlign: 'center' },
  section:     { padding: SIZES.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  sectionTitle:{ fontSize: 17, fontWeight: '700', color: COLORS.text },
  seeAll:      { color: COLORS.primary, fontSize: 13 },
  orderRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  orderId:     { fontSize: 13, fontWeight: '600', color: COLORS.text },
  orderStatus: { fontSize: 12, color: COLORS.muted },
  orderAmt:    { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  empty:       { textAlign: 'center', color: COLORS.muted },
});
