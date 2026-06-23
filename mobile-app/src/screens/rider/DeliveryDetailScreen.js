import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';
import locationService from '../../services/locationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function DeliveryDetailScreen({ route, navigation }) {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    orderService.getDeliveryById(deliveryId)
      .then(setDelivery)
      .catch(() => orderService.getOrderById(deliveryId).then(setDelivery))
      .finally(() => setLoading(false));
  }, [deliveryId]);

  const handleStart = async () => {
    setUpdating(true);
    try {
      await locationService.startBackgroundTracking(deliveryId);
      await orderService.startDelivery(deliveryId);
      setDelivery(prev => ({ ...prev, status: 'out_for_delivery' }));
      Alert.alert('Delivery Started', 'Your location is now being tracked.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally { setUpdating(false); }
  };

  const handleMarkDelivered = async () => {
    Alert.alert('Confirm Delivery', 'Mark this order as delivered?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delivered', onPress: async () => {
          setUpdating(true);
          try {
            await orderService.markDelivered(deliveryId);
            await locationService.stopBackgroundTracking();
            setDelivery(prev => ({ ...prev, status: 'delivered' }));
          } catch { Alert.alert('Error', 'Failed to update status'); }
          finally { setUpdating(false); }
        }
      },
    ]);
  };

  const openMaps = (addr) => {
    const query = encodeURIComponent(`${addr.street}, ${addr.city}`);
    Linking.openURL(`https://maps.google.com/?q=${query}`).catch(() => {});
  };

  if (loading)   return <LoadingScreen />;
  if (!delivery) return <View style={styles.container}><Text style={styles.empty}>Delivery not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.orderId}>Order #{delivery.id}</Text>
        <View style={[styles.badge, { backgroundColor: delivery.status === 'delivered' ? '#4CAF50' : COLORS.primary }]}>
          <Text style={styles.badgeText}>{delivery.status?.toUpperCase()}</Text>
        </View>
      </Card>

      {/* Delivery Address */}
      <Card>
        <Text style={styles.sectionLabel}>Delivery Address</Text>
        {delivery.deliveryAddress ? (
          <>
            <Text style={styles.addrText}>
              {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}
            </Text>
            <TouchableOpacity
              style={styles.mapsBtn}
              onPress={() => openMaps(delivery.deliveryAddress)}
            >
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text style={styles.mapsBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.addrText}>Address unavailable</Text>
        )}
      </Card>

      {/* Items */}
      <Card>
        <Text style={styles.sectionLabel}>Order Items</Text>
        {(delivery.items ?? []).map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </Card>

      {/* Actions */}
      {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
        <View style={styles.actions}>
          {delivery.status !== 'out_for_delivery' ? (
            <Button title="Start Delivery" onPress={handleStart} loading={updating} />
          ) : (
            <Button title="Mark as Delivered" onPress={handleMarkDelivered} loading={updating} />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background, padding: SIZES.lg },
  empty:        { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
  orderId:      { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  badge:        { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText:    { color: '#fff', fontSize: 11, fontWeight: '700' },
  sectionLabel: { fontSize: 13, color: COLORS.muted, marginBottom: SIZES.sm },
  addrText:     { fontSize: 14, color: COLORS.text },
  mapsBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SIZES.sm },
  mapsBtnText:  { color: COLORS.primary, fontSize: 14 },
  itemRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName:     { fontSize: 13, color: COLORS.muted },
  itemPrice:    { fontSize: 13, color: COLORS.text },
  actions:      { marginTop: SIZES.lg },
});
