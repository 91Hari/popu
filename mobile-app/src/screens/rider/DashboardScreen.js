import { useEffect, useState, useCallback } from 'react';
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

const BATCH_STATUS_LABEL = {
  ASSIGNED:   'Ready to Start',
  PICKING_UP: 'Picking Up Orders',
  DELIVERING: 'Out for Delivery',
};

const BATCH_STATUS_COLOR = {
  ASSIGNED:   COLORS.primary,
  PICKING_UP: '#E07B0A',
  DELIVERING: '#155724',
};

export default function RiderDashboardScreen({ navigation }) {
  const { user }          = useAuth();
  const [batch, setBatch] = useState(null);
  const [tracking, setTracking]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const resp = await orderService.getCurrentBatch();
      setBatch(resp?.batch ?? null);
    } catch {
      setBatch(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    locationService.isTrackingActive().then(setTracking).catch(() => {});
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const toggleTracking = async (val) => {
    if (val) {
      try {
        await locationService.startBackgroundTracking(null);
        setTracking(true);
        // Come online in delivery engine
        await orderService.setRiderDeliveryStatus('AVAILABLE');
      } catch (err) {
        Alert.alert('Permission Required', err.message);
      }
    } else {
      await locationService.stopBackgroundTracking();
      setTracking(false);
      await orderService.setRiderDeliveryStatus('OFFLINE').catch(() => {});
    }
  };

  if (loading) return <LoadingScreen />;

  const batchColor = batch ? (BATCH_STATUS_COLOR[batch.status] ?? COLORS.primary) : COLORS.muted;

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

      {/* Active batch card */}
      {batch ? (
        <TouchableOpacity
          style={[styles.batchCard, { borderColor: batchColor }]}
          onPress={() => navigation.navigate('ActiveBatch')}
          activeOpacity={0.85}
        >
          <View style={styles.batchTop}>
            <View style={[styles.batchBadge, { backgroundColor: batchColor }]}>
              <Ionicons name="bicycle" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.batchTitle}>Active Batch</Text>
              <Text style={[styles.batchStatus, { color: batchColor }]}>
                {BATCH_STATUS_LABEL[batch.status] ?? batch.status}
              </Text>
            </View>
            {batch.eta_minutes ? (
              <View style={styles.etaPill}>
                <Text style={styles.etaText}>{batch.eta_minutes} min</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} style={{ marginLeft: 4 }} />
          </View>

          <View style={styles.batchMeta}>
            <Text style={styles.batchMetaText}>
              {batch.task_count ?? (batch.tasks?.length ?? 0)} delivery task{batch.task_count !== 1 ? 's' : ''}
            </Text>
            {batch.tasks?.length > 0 && (
              <Text style={styles.batchMetaText} numberOfLines={1}>
                Next: {batch.tasks[0]?.caterer_business ?? batch.tasks[0]?.caterer_name ?? 'Pickup'}
              </Text>
            )}
          </View>

          <View style={[styles.startHint, { backgroundColor: batchColor + '18' }]}>
            <Text style={[styles.startHintText, { color: batchColor }]}>
              {batch.status === 'ASSIGNED' ? 'Tap to start delivery →' : 'Tap to manage batch →'}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noBatchCard}>
          <Ionicons name="time-outline" size={32} color={COLORS.muted} />
          <Text style={styles.noBatchTitle}>No active batch</Text>
          <Text style={styles.noBatchSub}>
            {tracking
              ? 'You will be assigned deliveries automatically.'
              : 'Go online to receive delivery batches.'}
          </Text>
        </View>
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Card style={styles.stat}>
          <Ionicons name="layers-outline" size={22} color={COLORS.primary} />
          <Text style={styles.statValue}>{batch ? (batch.tasks?.length ?? batch.task_count ?? 0) : 0}</Text>
          <Text style={styles.statLabel}>In Batch</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SIZES.lg },
  greeting:       { fontSize: 13, color: COLORS.muted },
  name:           { fontSize: 20, fontWeight: '700', color: COLORS.text },
  trackRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackLabel:     { fontSize: 13, fontWeight: '600' },
  trackingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, padding: SIZES.sm, paddingHorizontal: SIZES.lg, gap: 8 },
  trackingText:   { color: '#fff', fontSize: 13, fontWeight: '600' },

  batchCard:      { margin: SIZES.lg, borderRadius: 16, borderWidth: 2, backgroundColor: COLORS.surface, padding: SIZES.md, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  batchTop:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  batchBadge:     { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  batchTitle:     { fontSize: 13, color: COLORS.muted, marginLeft: 2 },
  batchStatus:    { fontSize: 15, fontWeight: '700', marginLeft: 2 },
  etaPill:        { backgroundColor: '#EEF4FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  etaText:        { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  batchMeta:      { marginTop: SIZES.sm, gap: 2 },
  batchMetaText:  { fontSize: 12, color: COLORS.muted },
  startHint:      { marginTop: SIZES.sm, borderRadius: 8, padding: 8, alignItems: 'center' },
  startHintText:  { fontSize: 12, fontWeight: '700' },

  noBatchCard:    { margin: SIZES.lg, borderRadius: 16, backgroundColor: COLORS.surface, padding: SIZES.xl, alignItems: 'center', gap: 8 },
  noBatchTitle:   { fontSize: 16, fontWeight: '700', color: COLORS.text },
  noBatchSub:     { fontSize: 12, color: COLORS.muted, textAlign: 'center' },

  statsRow:       { flexDirection: 'row', padding: SIZES.md, gap: SIZES.sm },
  stat:           { flex: 1, alignItems: 'center', margin: 0 },
  statValue:      { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  statLabel:      { fontSize: 10, color: COLORS.muted },
});
