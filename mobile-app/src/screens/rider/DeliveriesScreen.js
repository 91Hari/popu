import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

const TABS = ['active', 'history'];

const BATCH_STATUS_COLOR = {
  ASSIGNED:   COLORS.primary,
  PICKING_UP: '#E07B0A',
  DELIVERING: '#155724',
};

export default function RiderDeliveriesScreen({ navigation }) {
  const [tab, setTab]               = useState('active');
  const [batch, setBatch]           = useState(null);       // active batch
  const [history, setHistory]       = useState([]);         // legacy completed orders
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      if (tab === 'active') {
        const resp = await orderService.getCurrentBatch();
        setBatch(resp?.batch ?? null);
      } else {
        const data = await orderService.getRiderOrders({ status: 'delivered' });
        setHistory(Array.isArray(data) ? data : data?.deliveries ?? data?.orders ?? []);
      }
    } catch {
      if (tab === 'active') setBatch(null);
      else setHistory([]);
    }
  }, [tab]);

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [tab]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active tab — show current batch */}
      {tab === 'active' && (
        batch ? (
          <TouchableOpacity
            style={styles.batchCard}
            onPress={() => navigation.navigate('ActiveBatch')}
            activeOpacity={0.85}
          >
            <View style={styles.batchRow}>
              <View style={[styles.dot, { backgroundColor: BATCH_STATUS_COLOR[batch.status] ?? COLORS.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.batchId}>Batch #{batch.id?.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.batchStatus}>{batch.status?.replace('_', ' ')}</Text>
              </View>
              {batch.eta_minutes ? (
                <Text style={styles.eta}>{batch.eta_minutes} min</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </View>

            <View style={styles.taskSummary}>
              {(batch.tasks ?? []).map((t, i) => (
                <View key={t.task_id ?? i} style={styles.taskRow}>
                  <Ionicons
                    name={t.batch_task_status === 'PICKED_UP' ? 'bicycle-outline' : 'storefront-outline'}
                    size={13}
                    color={COLORS.muted}
                  />
                  <Text style={styles.taskText} numberOfLines={1}>
                    {i + 1}. {t.caterer_business ?? t.caterer_name} → {t.customer_name ?? 'Customer'}
                  </Text>
                  {t.batch_task_status === 'DELIVERED' && (
                    <Ionicons name="checkmark-circle" size={13} color="#155724" />
                  )}
                </View>
              ))}
            </View>

            <View style={styles.openHint}>
              <Text style={styles.openHintText}>Tap to open batch →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <EmptyState
            icon="bicycle-outline"
            title="No active batch"
            message="You will be assigned deliveries automatically when you are online."
          />
        )
      )}

      {/* History tab — legacy completed individual orders */}
      {tab === 'history' && (
        history.length === 0 ? (
          <EmptyState icon="receipt-outline" title="No delivery history" message="Completed deliveries will appear here." />
        ) : (
          <FlatList
            data={history}
            keyExtractor={i => String(i.id)}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            renderItem={({ item }) => (
              <View style={styles.histCard}>
                <View style={styles.histRow}>
                  <Text style={styles.histId}>#{String(item.id).slice(-6).toUpperCase()}</Text>
                  <Text style={styles.histTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.histAddr} numberOfLines={1}>
                  {item.delivery_street ?? item.customer_name ?? 'Delivered'}
                </Text>
                <Text style={styles.histAmt}>₹{item.subtotal?.toFixed(2) ?? '--'}</Text>
              </View>
            )}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },

  tabs:         { flexDirection: 'row', padding: SIZES.md, gap: SIZES.md },
  tab:          { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:      { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  tabTextActive:{ color: '#fff' },

  batchCard:    { margin: SIZES.lg, borderRadius: 14, backgroundColor: COLORS.surface, padding: SIZES.md, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  batchRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SIZES.sm },
  dot:          { width: 10, height: 10, borderRadius: 5 },
  batchId:      { fontSize: 15, fontWeight: '700', color: COLORS.text },
  batchStatus:  { fontSize: 11, color: COLORS.muted, textTransform: 'capitalize' },
  eta:          { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginRight: 4 },

  taskSummary:  { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: SIZES.sm, gap: 5 },
  taskRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskText:     { flex: 1, fontSize: 12, color: COLORS.text },

  openHint:     { marginTop: SIZES.sm, alignItems: 'flex-end' },
  openHintText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  list:         { padding: SIZES.lg },
  histCard:     { backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.sm },
  histRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  histId:       { fontSize: 14, fontWeight: '700', color: COLORS.text },
  histTime:     { fontSize: 11, color: COLORS.muted },
  histAddr:     { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  histAmt:      { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
