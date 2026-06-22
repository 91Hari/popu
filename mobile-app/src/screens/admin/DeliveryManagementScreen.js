import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import api from '../../services/api';

const POLL_INTERVAL = 20000;

const BATCH_STATUS_COLOR = {
  CREATED:    { bg: '#FFF3CD', text: '#856404' },
  ASSIGNED:   { bg: '#D1ECF1', text: '#0C5460' },
  PICKING_UP: { bg: '#CCE5FF', text: '#004085' },
  DELIVERING: { bg: '#D4EDDA', text: '#155724' },
  COMPLETED:  { bg: '#E2E3E5', text: '#383D41' },
};

const RIDER_STATUS_COLOR = {
  AVAILABLE:  { bg: '#D4EDDA', text: '#155724' },
  ASSIGNED:   { bg: '#D1ECF1', text: '#0C5460' },
  PICKING_UP: { bg: '#CCE5FF', text: '#004085' },
  DELIVERING: { bg: '#FFF3CD', text: '#856404' },
  OFFLINE:    { bg: '#E2E3E5', text: '#383D41' },
};

export default function DeliveryManagementScreen({ navigation }) {
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded]     = useState({});

  const fetchData = useCallback(async () => {
    try {
      const resp = await api.get('/delivery/admin/status');
      setData(resp.data);
    } catch (err) {
      console.warn('[DeliveryMgmt] fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const activeBatches = data?.active_batches ?? [];
  const riderStats    = data?.rider_stats    ?? [];
  const poolWaiting   = data?.pool_waiting   ?? 0;
  const today         = data?.today          ?? {};

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* ── Stats row ────────────────────────────────────────────── */}
      <View style={styles.statsGrid}>
        <_StatCard icon="layers-outline"   value={activeBatches.length} label="Active Batches" color={COLORS.primary} />
        <_StatCard icon="hourglass-outline" value={poolWaiting}          label="Pool Queue"    color="#856404" />
        <_StatCard icon="bicycle-outline"   value={today?.total ?? 0}    label="Today Total"  color="#0C5460" />
        <_StatCard icon="checkmark-circle-outline" value={today?.completed ?? 0} label="Completed"  color="#155724" />
      </View>

      {/* ── Rider status breakdown ───────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rider Status</Text>
        <View style={styles.riderRow}>
          {riderStats.length === 0
            ? <Text style={styles.empty}>No riders on record</Text>
            : riderStats.map(rs => {
                const cfg = RIDER_STATUS_COLOR[rs.delivery_status] ?? RIDER_STATUS_COLOR.OFFLINE;
                return (
                  <View key={rs.delivery_status} style={[styles.riderPill, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.riderPillVal, { color: cfg.text }]}>{rs.count}</Text>
                    <Text style={[styles.riderPillLabel, { color: cfg.text }]}>{rs.delivery_status}</Text>
                  </View>
                );
              })
          }
        </View>
      </View>

      {/* ── Pool queue alert ─────────────────────────────────────── */}
      {poolWaiting > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="time-outline" size={18} color="#856404" />
          <Text style={styles.alertText}>
            {poolWaiting} task{poolWaiting > 1 ? 's' : ''} waiting in pool — next batch in ~5 min
          </Text>
        </View>
      )}

      {/* ── Active batches ───────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Deliveries</Text>
        {activeBatches.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={COLORS.muted} />
            <Text style={styles.empty}>No active deliveries right now</Text>
          </View>
        ) : (
          activeBatches.map(batch => {
            const statusCfg = BATCH_STATUS_COLOR[batch.status] ?? BATCH_STATUS_COLOR.CREATED;
            const isOpen    = !!expanded[batch.id];
            return (
              <TouchableOpacity
                key={batch.id}
                style={styles.batchCard}
                onPress={() => toggleExpand(batch.id)}
                activeOpacity={0.85}
              >
                {/* Card header */}
                <View style={styles.batchHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.batchId}>Batch #{batch.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.batchMeta}>
                      {batch.task_count} task{batch.task_count !== 1 ? 's' : ''} ·{' '}
                      {batch.rider_name ?? 'Unassigned'}
                    </Text>
                  </View>
                  <View style={styles.batchRight}>
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                        {batch.status}
                      </Text>
                    </View>
                    {batch.eta_minutes ? (
                      <Text style={styles.etaText}>{batch.eta_minutes} min</Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16} color={COLORS.muted} style={{ marginLeft: 4 }}
                  />
                </View>

                {/* Expanded task list */}
                {isOpen && (
                  <View style={styles.taskList}>
                    {batch.current_latitude && (
                      <Text style={styles.riderLocation}>
                        Rider: {parseFloat(batch.current_latitude).toFixed(4)}, {parseFloat(batch.current_longitude).toFixed(4)}
                      </Text>
                    )}
                    {(batch.tasks ?? []).map(task => (
                      <View key={task.task_id} style={styles.taskRow}>
                        <Text style={styles.taskSeq}>#{task.sequence}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.taskText}>
                            Caterer order: {String(task.caterer_order_id).slice(0, 8).toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.miniTag, _taskTagStyle(task.task_status)]}>
                          <Text style={styles.miniTagText}>{task.task_status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function _taskTagStyle(status) {
  const map = {
    PENDING:    { backgroundColor: '#FFF3CD' },
    ASSIGNED:   { backgroundColor: '#D1ECF1' },
    PICKED_UP:  { backgroundColor: '#CCE5FF' },
    DELIVERING: { backgroundColor: '#D4EDDA' },
    COMPLETED:  { backgroundColor: '#D4EDDA' },
    CANCELLED:  { backgroundColor: '#F8D7DA' },
  };
  return map[status] ?? { backgroundColor: '#E2E3E5' };
}

function _StatCard({ icon, value, label, color }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },

  statsGrid:      { flexDirection: 'row', flexWrap: 'wrap', padding: SIZES.md, gap: SIZES.sm },
  statCard:       { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  statValue:      { fontSize: 24, fontWeight: '800', marginTop: 4 },
  statLabel:      { fontSize: 10, color: COLORS.muted, marginTop: 2 },

  section:        { paddingHorizontal: SIZES.lg, marginTop: SIZES.md },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },

  riderRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  riderPill:      { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  riderPillVal:   { fontSize: 16, fontWeight: '800' },
  riderPillLabel: { fontSize: 9, fontWeight: '600' },

  alertBanner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', margin: SIZES.lg, borderRadius: 10, padding: SIZES.md, gap: 8 },
  alertText:      { fontSize: 13, color: '#856404', flex: 1 },

  emptyCard:      { alignItems: 'center', paddingVertical: SIZES.xl },
  empty:          { color: COLORS.muted, fontSize: 13, marginTop: 8 },

  batchCard:      { backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.sm, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  batchHeader:    { flexDirection: 'row', alignItems: 'center' },
  batchId:        { fontSize: 14, fontWeight: '700', color: COLORS.text },
  batchMeta:      { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  batchRight:     { alignItems: 'flex-end', gap: 4 },
  statusBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText:{ fontSize: 10, fontWeight: '700' },
  etaText:        { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  taskList:       { marginTop: SIZES.sm, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SIZES.sm, gap: 6 },
  riderLocation:  { fontSize: 10, color: COLORS.muted, marginBottom: 4 },
  taskRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskSeq:        { fontSize: 11, fontWeight: '700', color: COLORS.muted, width: 20 },
  taskText:       { fontSize: 11, color: COLORS.text },
  miniTag:        { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  miniTagText:    { fontSize: 9, fontWeight: '700', color: '#383D41' },
});
