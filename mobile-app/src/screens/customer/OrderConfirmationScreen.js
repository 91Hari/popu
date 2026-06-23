import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import Button from '../../components/common/Button';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { order } = route.params ?? {};

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons name="checkmark-circle" size={80} color={COLORS.primary} />
      </View>

      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.subtitle}>
        Your order #{order?._id?.slice(-6).toUpperCase() ?? '------'} has been placed successfully.
      </Text>

      {order?.masterOrderId && (
        <Text style={styles.meta}>Master Order: #{order.masterOrderId?.slice(-6).toUpperCase()}</Text>
      )}

      <Text style={styles.eta}>Estimated delivery: 30–45 minutes</Text>

      <View style={styles.actions}>
        <Button
          title="Track Order"
          onPress={() => navigation.replace('OrderDetail', { orderId: order?._id ?? order?.masterOrderId })}
        />
        <Button
          title="Continue Shopping"
          variant="outline"
          onPress={() => navigation.replace('CustomerTabs')}
          style={styles.secondBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  icon:      { marginBottom: SIZES.xl },
  title:     { fontSize: 28, fontWeight: '900', color: COLORS.text },
  subtitle:  { fontSize: 15, color: COLORS.muted, textAlign: 'center', marginTop: SIZES.sm, lineHeight: 22 },
  meta:      { fontSize: 13, color: COLORS.muted, marginTop: SIZES.sm },
  eta:       { fontSize: 15, color: COLORS.primary, fontWeight: '600', marginTop: SIZES.md },
  actions:   { width: '100%', marginTop: SIZES.xl },
  secondBtn: { marginTop: SIZES.md },
});
