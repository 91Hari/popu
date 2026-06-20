import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';

const POLL_INTERVAL = 8000;

export default function TrackOrderScreen({ route }) {
  const { orderId } = route.params;
  const [riderLocation, setRiderLocation] = useState(null);
  const [order, setOrder]                 = useState(null);
  const intervalRef = useRef(null);

  const fetchLocation = async () => {
    try {
      const data = await orderService.getRiderLocation(orderId);
      if (data?.lat && data?.lng) {
        setRiderLocation({ latitude: data.lat, longitude: data.lng });
      }
    } catch {}
  };

  useEffect(() => {
    orderService.getOrderById(orderId).then(setOrder).catch(() => {});
    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  const deliveryCoords = order?.deliveryAddress
    ? { latitude: order.deliveryAddress.lat, longitude: order.deliveryAddress.lng }
    : null;

  const initialRegion = riderLocation
    ? { ...riderLocation, latitudeDelta: 0.03, longitudeDelta: 0.03 }
    : deliveryCoords
    ? { ...deliveryCoords, latitudeDelta: 0.03, longitudeDelta: 0.03 }
    : { latitude: 17.385, longitude: 78.487, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation
      >
        {riderLocation && (
          <Marker coordinate={riderLocation} title="Your Rider">
            <View style={styles.riderPin}>
              <Ionicons name="bicycle" size={20} color="#fff" />
            </View>
          </Marker>
        )}
        {deliveryCoords && (
          <Marker coordinate={deliveryCoords} title="Delivery Address" pinColor={COLORS.primary} />
        )}
        {riderLocation && deliveryCoords && (
          <Polyline
            coordinates={[riderLocation, deliveryCoords]}
            strokeColor={COLORS.primary}
            strokeWidth={3}
            lineDashPattern={[6, 4]}
          />
        )}
      </MapView>

      <View style={styles.infoCard}>
        <Text style={styles.status}>
          {order?.status === 'delivered' ? '✅ Delivered!' : '🛵 Rider is on the way'}
        </Text>
        <Text style={styles.eta}>Estimated arrival: 15–25 min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },
  riderPin:  { backgroundColor: COLORS.secondary, borderRadius: 20, padding: 6 },
  infoCard:  {
    position:        'absolute',
    bottom:          SIZES.xl,
    left:            SIZES.lg,
    right:           SIZES.lg,
    backgroundColor: COLORS.surface,
    borderRadius:    16,
    padding:         SIZES.lg,
    alignItems:      'center',
    elevation:       8,
    shadowColor:     '#000',
    shadowOpacity:   0.15,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: -2 },
  },
  status:    { fontSize: 16, fontWeight: '700', color: COLORS.text },
  eta:       { fontSize: 13, color: COLORS.muted, marginTop: 4 },
});
