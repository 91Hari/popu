import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import orderService from '../../services/orderService';
import LoadingScreen from '../../components/common/LoadingScreen';
import Card from '../../components/common/Card';

const STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMasterOrderById(orderId)
      .then(setOrder)
      .catch(() => orderService.getOrderById(orderId).then(setOrder))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingScreen />;
  if (!order)  return <View style={styles.container}><Text style={styles.error}>Order not found</Text></View>;

  const stepIndex = STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container}>
      {/* Status */}
      <Card>
        <Text style={styles.orderTitle}>Order #{order._id?.slice(-6).toUpperCase()}</Text>
        <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</Text>

        <View style={styles.stepper}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <View style={[styles.step, i <= stepIndex && styles.stepDone]}>
                {i <= stepIndex
                  ? <Ionicons name="checkmark" size={14} color="#fff" />
                  : <Text style={styles.stepNum}>{i + 1}</Text>
                }
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, i < stepIndex && styles.stepLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.stepLabels}>
          {STEPS.map(s => (
            <Text key={s} style={styles.stepLabel}>{s}</Text>
          ))}
        </View>
      </Card>

      {/* Track rider */}
      {['ready', 'out_for_delivery'].includes(order.status) && (
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('TrackOrder', { orderId: order._id })}
        >
          <Ionicons name="navigate-outline" size={20} color="#fff" />
          <Text style={styles.trackText}>Track your rider</Text>
        </TouchableOpacity>
      )}

      {/* Sub-orders */}
      {(order.subOrders ?? order.items ?? []).map((sub, idx) => (
        <Card key={sub._id ?? idx}>
          {sub.caterer && <Text style={styles.catName}>{sub.caterer.name}</Text>}
          {(sub.items ?? []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </Card>
      ))}

      {/* Total */}
      <Card>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>₹{order.totalAmount?.toFixed(2)}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background, padding: SIZES.lg },
  error:         { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
  orderTitle:    { fontSize: 18, fontWeight: '700', color: COLORS.text },
  orderDate:     { fontSize: 12, color: COLORS.muted, marginBottom: SIZES.md },
  stepper:       { flexDirection: 'row', alignItems: 'center', marginVertical: SIZES.md },
  step:          { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepDone:      { backgroundColor: COLORS.primary },
  stepNum:       { fontSize: 11, color: COLORS.muted },
  stepLine:      { flex: 1, height: 2, backgroundColor: COLORS.border },
  stepLineDone:  { backgroundColor: COLORS.primary },
  stepLabels:    { flexDirection: 'row', justifyContent: 'space-between' },
  stepLabel:     { fontSize: 9, color: COLORS.muted, textAlign: 'center', flex: 1 },
  trackBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.md },
  trackText:     { color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 15 },
  catName:       { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm },
  itemRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemName:      { fontSize: 13, color: COLORS.muted },
  itemPrice:     { fontSize: 13, color: COLORS.text },
  totalRow:      { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel:    { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue:    { fontSize: 18, fontWeight: '700', color: COLORS.primary },
});
