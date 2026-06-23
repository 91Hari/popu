import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SIZES } from '../../config/theme';
import Button from '../../components/common/Button';
import profileService from '../../services/profileService';
import orderService from '../../services/orderService';

const PAYMENT_METHODS = [
  { id: 'cod',   label: 'Cash on Delivery', icon: 'cash-outline' },
  { id: 'upi',   label: 'UPI / QR Code',    icon: 'qr-code-outline' },
  { id: 'card',  label: 'Credit / Debit Card', icon: 'card-outline' },
];

export default function CheckoutScreen({ navigation }) {
  const { items, total, clearCart } = useCart();
  const [addresses, setAddresses]   = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [payment, setPayment]       = useState('cod');
  const [placing, setPlacing]       = useState(false);
  const deliveryFee = 30;

  useEffect(() => {
    profileService.getAddresses()
      .then(a => {
        const list = Array.isArray(a) ? a : a?.addresses ?? [];
        setAddresses(list);
        setSelectedAddr(list.find(x => x.isDefault) ?? list[0] ?? null);
      })
      .catch(() => {});
  }, []);

  const placeOrder = async () => {
    if (!selectedAddr) {
      Alert.alert('Address Required', 'Please add a delivery address first.');
      return;
    }
    setPlacing(true);
    try {
      const res = await orderService.checkout({
        deliveryAddressId: selectedAddr._id,
        paymentMethod:     payment,
      });
      await clearCart();
      navigation.replace('OrderConfirmation', { order: res });
    } catch (err) {
      Alert.alert('Order Failed', err?.message ?? 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Delivery Address */}
        <Text style={styles.section}>Delivery Address</Text>
        {addresses.length === 0 ? (
          <TouchableOpacity style={styles.addAddrCard} onPress={() => navigation.navigate('AddAddress')}>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.addAddrText}>Add delivery address</Text>
          </TouchableOpacity>
        ) : (
          addresses.map(addr => (
            <TouchableOpacity
              key={addr._id}
              style={[styles.addrCard, selectedAddr?._id === addr._id && styles.addrCardSelected]}
              onPress={() => setSelectedAddr(addr)}
            >
              <Ionicons
                name={selectedAddr?._id === addr._id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={COLORS.primary}
              />
              <View style={styles.addrInfo}>
                <Text style={styles.addrLabel}>{addr.label ?? 'Home'}</Text>
                <Text style={styles.addrText}>{addr.street}, {addr.city}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Payment */}
        <Text style={styles.section}>Payment Method</Text>
        {PAYMENT_METHODS.map(pm => (
          <TouchableOpacity
            key={pm.id}
            style={[styles.pmCard, payment === pm.id && styles.pmCardSelected]}
            onPress={() => setPayment(pm.id)}
          >
            <Ionicons name={pm.icon} size={22} color={payment === pm.id ? COLORS.primary : COLORS.muted} />
            <Text style={[styles.pmLabel, payment === pm.id && { color: COLORS.primary }]}>{pm.label}</Text>
            <Ionicons
              name={payment === pm.id ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={COLORS.primary}
              style={styles.radioRight}
            />
          </TouchableOpacity>
        ))}

        {/* Order Summary */}
        <Text style={styles.section}>Order Summary</Text>
        {items.map(i => (
          <View key={i._id ?? i.foodId} style={styles.summaryRow}>
            <Text style={styles.summaryItem}>{i.name} × {i.quantity}</Text>
            <Text style={styles.summaryPrice}>₹{(i.price * i.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total (incl. delivery)</Text>
          <Text style={styles.totalValue}>₹{(total + deliveryFee).toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={`Place Order  ₹${(total + deliveryFee).toFixed(2)}`} onPress={placeOrder} loading={placing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  content:         { padding: SIZES.lg, paddingBottom: SIZES.xl },
  section:         { fontSize: 17, fontWeight: '700', color: COLORS.text, marginVertical: SIZES.md },
  addAddrCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.primary, marginBottom: SIZES.sm },
  addAddrText:     { color: COLORS.primary, marginLeft: 8, fontSize: 14 },
  addrCard:        { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.sm, borderWidth: 1, borderColor: 'transparent' },
  addrCardSelected:{ borderColor: COLORS.primary },
  addrInfo:        { marginLeft: 10 },
  addrLabel:       { fontSize: 14, fontWeight: '600', color: COLORS.text },
  addrText:        { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  pmCard:          { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: SIZES.sm, borderWidth: 1, borderColor: 'transparent' },
  pmCardSelected:  { borderColor: COLORS.primary },
  pmLabel:         { flex: 1, fontSize: 14, color: COLORS.text, marginLeft: 10 },
  radioRight:      { marginLeft: 'auto' },
  summaryRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryItem:     { fontSize: 13, color: COLORS.muted },
  summaryPrice:    { fontSize: 13, color: COLORS.text },
  totalRow:        { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginTop: SIZES.sm },
  totalLabel:      { fontSize: 15, fontWeight: '700', color: COLORS.text },
  totalValue:      { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  footer:          { padding: SIZES.lg, backgroundColor: COLORS.surface },
});
