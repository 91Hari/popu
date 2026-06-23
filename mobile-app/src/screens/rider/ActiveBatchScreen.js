import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const POLL_INTERVAL = 15000;

// ─── Status badge colours ─────────────────────────────────────────────────────
const TASK_BADGE = {
  PENDING:   { bg: '#FFF3CD', text: '#856404', label: 'Waiting' },
  PICKED_UP: { bg: '#D1ECF1', text: '#0C5460', label: 'Picked Up' },
  DELIVERED: { bg: '#D4EDDA', text: '#155724', label: 'Delivered' },
  FAILED:    { bg: '#F8D7DA', text: '#721C24', label: 'Failed' },
};

const BATCH_STATUS_LABEL = {
  ASSIGNED:   'Ready to Start',
  PICKING_UP: 'Picking Up',
  DELIVERING: 'Out for Delivery',
  COMPLETED:  'Completed',
};

export default function ActiveBatchScreen({ navigation }) {
  const { user }                    = useAuth();
  const [batch, setBatch]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBatch = useCallback(async () => {
    try {
      const resp = await api.get('/delivery/rider/current-batch');
      setBatch(resp.data?.batch ?? null);
    } catch {
      setBatch(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBatch().finally(() => setLoading(false));
    const interval = setInterval(fetchBatch, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBatch]);

  const onRefresh = async () => { setRefreshing(true); await fetchBatch(); setRefreshing(false); };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleStartDelivery = async () => {
    if (!batch) return;
    Alert.alert('Start Delivery', 'Begin picking up orders in this batch?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.post(`/delivery/rider/batch/${batch.id}/start`);
            await fetchBatch();
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.error ?? 'Failed to start delivery');
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handlePickedUp = async (taskId) => {
    if (!batch) return;
    setActionLoading(true);
    try {
      await api.patch(`/delivery/rider/batch/${batch.id}/task/${taskId}/pickup`);
      await fetchBatch();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to mark picked up');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async (task) => {
    if (!batch) return;
    Alert.prompt(
      'Confirm Delivery',
      `Enter the 6-digit code from ${task.customer_name ?? 'customer'}:`,
      async (code) => {
        if (!code) return;
        setActionLoading(true);
        try {
          await api.patch(`/delivery/rider/batch/${batch.id}/task/${task.task_id}/deliver`, { code });
          await fetchBatch();
          Alert.alert('Delivered!', 'Order marked as delivered.');
        } catch (err) {
          Alert.alert('Error', err?.response?.data?.error ?? 'Failed to confirm delivery');
        } finally {
          setActionLoading(false);
        }
      },
      'plain-text'
    );
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const pickups  = batch?.tasks?.filter(t => t.batch_task_status === 'PENDING')  ?? [];
  const pickedUp = batch?.tasks?.filter(t => t.batch_task_status === 'PICKED_UP') ?? [];
  const done     = batch?.tasks?.filter(t => ['DELIVERED', 'FAILED'].includes(t.batch_task_status)) ?? [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!batch) {
    return (
      <View style={styles.center}>
        <Ionicons name="bicycle-outline" size={64} color={COLORS.muted} />
        <Text style={styles.emptyTitle}>No Active Batch</Text>
        <Text style={styles.emptySubtitle}>You will be assigned deliveries automatically.</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Batch header */}
      <View style={styles.batchHeader}>
        <View>
          <Text style={styles.batchId}>Batch #{batch.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.batchStatus}>{BATCH_STATUS_LABEL[batch.status] ?? batch.status}</Text>
        </View>
        {batch.eta_minutes ? (
          <View style={styles.etaBadge}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.etaText}>{batch.eta_minutes} min</Text>
          </View>
        ) : null}
      </View>

      {/* Progress row */}
      <View style={styles.progressRow}>
        <_Pill icon="cube-outline"     label={`${pickups.length} to pickup`}  color="#856404" bg="#FFF3CD" />
        <_Pill icon="bicycle-outline"  label={`${pickedUp.length} picked up`} color="#0C5460" bg="#D1ECF1" />
        <_Pill icon="checkmark-circle" label={`${done.length} delivered`}     color="#155724" bg="#D4EDDA" />
      </View>

      {/* START DELIVERY button */}
      {batch.status === 'ASSIGNED' && (
        <TouchableOpacity
          style={[styles.primaryBtn, actionLoading && styles.disabled]}
          onPress={handleStartDelivery}
          disabled={actionLoading}
        >
          {actionLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnText}>START DELIVERY</Text>}
        </TouchableOpacity>
      )}

      {/* Pickup locations */}
      {pickups.length > 0 && (
        <_Section title="Pickup Locations" icon="storefront-outline">
          {pickups.map((task, i) => (
            <View key={task.task_id} style={styles.taskCard}>
              <View style={styles.taskRow}>
                <View style={styles.taskIndex}><Text style={styles.taskIndexText}>{i + 1}</Text></View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.caterer_business ?? task.caterer_name}</Text>
                  <Text style={styles.taskSub} numberOfLines={1}>
                    {task.pickup_lat ? `${parseFloat(task.pickup_lat).toFixed(4)}, ${parseFloat(task.pickup_lng).toFixed(4)}` : 'Location unavailable'}
                  </Text>
                </View>
                <_Badge config={TASK_BADGE['PENDING']} />
              </View>
              {batch.status !== 'ASSIGNED' && (
                <TouchableOpacity
                  style={[styles.actionBtn, actionLoading && styles.disabled]}
                  onPress={() => handlePickedUp(task.task_id)}
                  disabled={actionLoading}
                >
                  <Text style={styles.actionBtnText}>Mark Picked Up</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </_Section>
      )}

      {/* Picked up — awaiting delivery */}
      {pickedUp.length > 0 && (
        <_Section title="Drop Locations" icon="location-outline">
          {pickedUp.map((task, i) => (
            <View key={task.task_id} style={styles.taskCard}>
              <View style={styles.taskRow}>
                <View style={[styles.taskIndex, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.taskIndexText}>{i + 1}</Text>
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.customer_name ?? 'Customer'}</Text>
                  {task.customer_phone ? (
                    <Text style={styles.taskSub}>{task.customer_phone}</Text>
                  ) : null}
                  <Text style={styles.taskSub} numberOfLines={1}>
                    {task.drop_lat ? `${parseFloat(task.drop_lat).toFixed(4)}, ${parseFloat(task.drop_lng).toFixed(4)}` : 'Location unavailable'}
                  </Text>
                </View>
                <_Badge config={TASK_BADGE['PICKED_UP']} />
              </View>
              {task.delivery_code && (
                <Text style={styles.codeHint}>Confirm code: {task.delivery_code}</Text>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, styles.deliverBtn, actionLoading && styles.disabled]}
                onPress={() => handleDeliver(task)}
                disabled={actionLoading}
              >
                <Text style={styles.actionBtnText}>Confirm Delivery</Text>
              </TouchableOpacity>
            </View>
          ))}
        </_Section>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <_Section title="Completed" icon="checkmark-done-outline">
          {done.map(task => (
            <View key={task.task_id} style={[styles.taskCard, styles.doneCard]}>
              <View style={styles.taskRow}>
                <Ionicons name="checkmark-circle" size={22} color="#155724" />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.customer_name ?? 'Customer'}</Text>
                </View>
                <_Badge config={TASK_BADGE[task.batch_task_status] ?? TASK_BADGE['DELIVERED']} />
              </View>
            </View>
          ))}
        </_Section>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function _Section({ title, icon, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function _Badge({ config }) {
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function _Pill({ icon, label, color, bg }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  emptyTitle:     { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: SIZES.lg },
  emptySubtitle:  { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 8 },
  refreshBtn:     { marginTop: SIZES.lg, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  refreshBtnText: { color: '#fff', fontWeight: '700' },

  batchHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderColor: COLORS.border },
  batchId:        { fontSize: 18, fontWeight: '800', color: COLORS.text },
  batchStatus:    { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  etaBadge:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF4FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  etaText:        { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  progressRow:    { flexDirection: 'row', padding: SIZES.md, gap: 8 },
  pill:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, paddingVertical: 6, gap: 4 },
  pillText:       { fontSize: 10, fontWeight: '600' },

  primaryBtn:     { margin: SIZES.lg, backgroundColor: COLORS.primary, borderRadius: 14, padding: SIZES.md, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  disabled:       { opacity: 0.6 },

  section:        { paddingHorizontal: SIZES.lg, marginTop: SIZES.md },
  sectionHead:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SIZES.sm },
  sectionTitle:   { fontSize: 15, fontWeight: '700', color: COLORS.text },

  taskCard:       { backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  doneCard:       { opacity: 0.7 },
  taskRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskIndex:      { width: 28, height: 28, borderRadius: 14, backgroundColor: '#856404', alignItems: 'center', justifyContent: 'center' },
  taskIndexText:  { color: '#fff', fontSize: 12, fontWeight: '800' },
  taskInfo:       { flex: 1 },
  taskTitle:      { fontSize: 14, fontWeight: '700', color: COLORS.text },
  taskSub:        { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  badge:          { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:      { fontSize: 10, fontWeight: '700' },
  codeHint:       { fontSize: 12, color: COLORS.muted, marginTop: 6, marginLeft: 38 },

  actionBtn:      { marginTop: SIZES.sm, backgroundColor: COLORS.primary, borderRadius: 8, padding: 10, alignItems: 'center' },
  deliverBtn:     { backgroundColor: '#28a745' },
  actionBtnText:  { color: '#fff', fontSize: 13, fontWeight: '700' },
});
