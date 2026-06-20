import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Switch, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';
import locationService from '../../services/locationService';
import Card from '../../components/common/Card';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function RiderDashboardScreen({ navigation }) {
  const { user }            = useAuth();
  const [deliveries, setDeliveries]   = useState([]);
  const [tracking, setTracking]       = useState(false);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await orderService.getRiderOrders({ status: 'pending,confirmed,ready', limit: 5 });
      setDeliveries(Array.isArray(data) ? data : data?.deliveries ?? data?.orders ?? []);
    } catch { setDeliveries([]); }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    locationService.isTrackingActive().then(setTracking);
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const toggleTracking = async (val) => {
    if (val) {
      try {
        await locationService.startBackgroundTracking(null);
        setTracking(true);
      } catch (err) {
        Alert.alert('Permission Required', err.message);
      }
    } else {
      await locationService.stopBackgroundTracking();
      setTracking(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <View style={styles.trackRow}>
          <Text style={[styles.trackLabel, { color: tracking ? COLORS.primary : COLORS.muted }]}>
            {tracking ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={tracking}
            onValueChange={toggleTracking}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {tracking && (
        <View style={styles.trackingBanner}>
          <Ionicons name="locate" size={16} color="#fff" />
          <Text style={styles.trackingText}>Location sharing active</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.stat}>
          <Ionicons name="bicycle-outline" size={22} color={COLORS.primary} />
          <Text style={styles.statValue}>{deliveries.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </Card>
        <Card style={styles.stat}>
          <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Today</Text>
        </Card>
        <Card style={styles.stat}>
          <Ionicons name="cash-outline" size={22} color={COLORS.secondary} />
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </Card>
      </View>

      {/* Pending Deliveries */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Pending Deliveries</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RiderDeliveries')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {deliveries.length === 0 ? (
          <Text style={styles.empty}>No pending deliveries</Text>
        ) : deliveries.slice(0, 3).map(d => (
          <TouchableOpacity
            key={d.id}
            style={styles.deliveryCard}
            onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: d.id })}
          >
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryId}>Order #{d.id}</Text>
              <Text style={styles.deliveryAddr} numberOfLines={1}>
                {d.delivery_street ?? d.customer_name ?? 'Pending'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SIZES.lg },
  greeting:      { fontSize: 13, color: COLORS.muted },
  name:          { fontSize: 20, fontWeight: '700', color: COLORS.text },
  trackRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackLabel:    { fontSize: 13, fontWeight: '600' },
  trackingBanner:{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: SIZES.sm, paddingHorizontal: SIZES.lg, gap: 8 },
  trackingText:  { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow:      { flexDirection: 'row', padding: SIZES.md, gap: SIZES.sm },
  stat:          { flex: 1, alignItems: 'center', margin: 0, marginBottom: 0 },
  statValue:     { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  statLabel:     { fontSize: 10, color: COLORS.muted },
  section:       { padding: SIZES.lg },
  sectionHead:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  sectionTitle:  { fontSize: 17, fontWeight: '700', color: COLORS.text },
  seeAll:        { color: COLORS.primary, fontSize: 13 },
  empty:         { color: COLORS.muted, textAlign: 'center', marginTop: SIZES.xl },
  deliveryCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.sm },
  deliveryInfo:  { flex: 1, marginLeft: 10 },
  deliveryId:    { fontSize: 14, fontWeight: '700', color: COLORS.text },
  deliveryAddr:  { fontSize: 12, color: COLORS.muted },
});
