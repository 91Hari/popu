import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import api from '../../services/api';

const POLL_INTERVAL = 10000;

// ── Status display config ──────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG = {
  PLACED:             { icon: 'receipt-outline',        color: '#856404', label: 'Order Placed' },
  ACCEPTED:           { icon: 'checkmark-circle-outline', color: '#0C5460', label: 'Accepted' },
  PREPARING:          { icon: 'flame-outline',           color: '#E07B0A', label: 'Preparing' },
  READY:              { icon: 'bag-check-outline',       color: COLORS.primary, label: 'Ready for Pickup' },
  ASSIGNED_TO_RIDER:  { icon: 'bicycle-outline',        color: COLORS.primary, label: 'Rider Assigned' },
  OUT_FOR_DELIVERY:   { icon: 'navigate-outline',        color: '#155724', label: 'Out for Delivery' },
  DELIVERED:          { icon: 'checkmark-done-circle',   color: '#155724', label: 'Delivered' },
  CANCELLED:          { icon: 'close-circle-outline',    color: '#721C24', label: 'Cancelled' },
  AUTO_CANCELLED:     { icon: 'close-circle-outline',    color: '#721C24', label: 'Auto-Cancelled' },
};

export default function TrackOrderScreen({ route }) {
  const { masterOrderId } = route.params;

  const [tracking, setTracking]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [riderCoords, setRiderCoords] = useState(null);
  const intervalRef = useRef(null);

  const fetchTracking = useCallback(async () => {
    try {
      const resp = await api.get(`/delivery/customer/tracking/${masterOrderId}`);
      const rows = resp.data?.tracking ?? [];
      setTracking(rows);

      // Pick rider location from any active batch entry
      const active = rows.find(r => r.rider_lat && r.rider_lng);
      if (active) {
        setRiderCoords({
          latitude:  parseFloat(active.rider_lat),
          longitude: parseFloat(active.rider_lng),
        });
      }
    } catch {
      /* silent — polling continues */
    }
  }, [masterOrderId]);

  useEffect(() => {
    setLoading(true);
    fetchTracking().finally(() => setLoading(false));
    intervalRef.current = setInterval(fetchTracking, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchTracking]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Derive overall ETA: take max batch_eta across entries (food is slowest path)
  const etaMinutes = tracking.reduce((max, r) => {
    const v = r.batch_eta_minutes ?? r.eta_minutes ?? 0;
    return v > max ? v : max;
  }, 0);

  const mapRegion = riderCoords
    ? { ...riderCoords, latitudeDelta: 0.04, longitudeDelta: 0.04 }
    : { latitude: 17.385, longitude: 78.487, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  const hasRider = !!riderCoords;
  const allDelivered = tracking.length > 0 && tracking.every(r =>
    ['DELIVERED', 'CANCELLED', 'AUTO_CANCELLED'].includes(r.order_status)
  );

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={mapRegion}
        showsUserLocation
      >
        {riderCoords && (
          <Marker coordinate={riderCoords} title="Your Rider">
            <View style={styles.riderPin}>
              <Ionicons name="bicycle" size={18} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Status panel */}
      <View style={styles.panel}>
        {/* ETA banner */}
        <View style={styles.etaBanner}>
          {allDelivered ? (
            <>
              <Ionicons name="checkmark-done-circle" size={22} color="#155724" />
              <Text style={styles.etaText}>All orders delivered!</Text>
            </>
          ) : hasRider ? (
            <>
              <Ionicons name="navigate-outline" size={22} color={COLORS.primary} />
              <Text style={styles.etaText}>
                {etaMinutes > 0 ? `ETA: ${etaMinutes} min` : 'Rider on the way'}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="time-outline" size={22} color="#856404" />
              <Text style={styles.etaText}>Preparing your order…</Text>
            </>
          )}
        </View>

        {/* Per-caterer status list */}
        <ScrollView style={styles.statusList} showsVerticalScrollIndicator={false}>
          {tracking.map(row => {
            const cfg = ORDER_STATUS_CONFIG[row.order_status] ?? ORDER_STATUS_CONFIG.PLACED;

            return (
              <View key={row.caterer_order_id} style={styles.catererRow}>
                {/* Caterer name + order status */}
                <View style={styles.catererHeader}>
                  <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                  <Text style={styles.catererName}>
                    {row.caterer_business ?? row.caterer_name}
                  </Text>
                  <View style={[styles.statusChip, { borderColor: cfg.color }]}>
                    <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                    <Text style={[styles.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                {/* Rider info (if assigned) */}
                {row.rider_name && (
                  <View style={styles.riderRow}>
                    <Ionicons name="bicycle-outline" size={13} color={COLORS.muted} />
                    <Text style={styles.riderText}>
                      {row.rider_name}
                      {row.vehicle_type ? ` · ${row.vehicle_type}` : ''}
                      {row.vehicle_number ? ` · ${row.vehicle_number}` : ''}
                    </Text>
                  </View>
                )}

                {/* ETA for this sub-order */}
                {row.expected_arrival_at && !['DELIVERED', 'CANCELLED'].includes(row.order_status) && (
                  <View style={styles.subEtaRow}>
                    <Ionicons name="time-outline" size={12} color={COLORS.muted} />
                    <Text style={styles.subEtaText}>
                      Expected: {new Date(row.expected_arrival_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit', hour12: true,
                      })}
                    </Text>
                  </View>
                )}

                {/* Status timeline dots */}
                <View style={styles.timeline}>
                  {['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED_TO_RIDER', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(s => {
                    const ORDER = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED_TO_RIDER', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                    const currentIdx = ORDER.indexOf(row.order_status);
                    const thisIdx    = ORDER.indexOf(s);
                    const done       = thisIdx <= currentIdx;
                    return (
                      <View key={s} style={styles.tlStep}>
                        <View style={[styles.tlDot, done && styles.tlDotDone]} />
                        {thisIdx < ORDER.length - 1 && (
                          <View style={[styles.tlLine, done && styles.tlLineDone]} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  map:       { flex: 1 },
  riderPin:  { backgroundColor: COLORS.primary, borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#fff' },

  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '55%',
    paddingTop: SIZES.md,
    elevation: 12,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: -4 },
  },

  etaBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: SIZES.lg, paddingBottom: SIZES.sm, borderBottomWidth: 1, borderColor: COLORS.border },
  etaText:     { fontSize: 15, fontWeight: '700', color: COLORS.text },

  statusList:  { paddingHorizontal: SIZES.lg, paddingBottom: 24 },
  catererRow:  { paddingVertical: SIZES.md, borderBottomWidth: 1, borderColor: COLORS.border },
  catererHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  statusDot:   { width: 8, height: 8, borderRadius: 4 },
  catererName: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  statusChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  statusChipText: { fontSize: 10, fontWeight: '700' },

  riderRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 16 },
  riderText:   { fontSize: 11, color: COLORS.muted },

  subEtaRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 16 },
  subEtaText:  { fontSize: 11, color: COLORS.muted },

  timeline:    { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 16 },
  tlStep:      { flexDirection: 'row', alignItems: 'center' },
  tlDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  tlDotDone:   { backgroundColor: COLORS.primary },
  tlLine:      { width: 16, height: 2, backgroundColor: COLORS.border },
  tlLineDone:  { backgroundColor: COLORS.primary },
});
