import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SIZES } from '../../config/theme';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function CartScreen({ navigation }) {
  const { items, total, caterer, loading, fetchCart, updateItem, removeItem, clearCart, itemCount } = useCart();

  useEffect(() => { fetchCart(); }, []);

  if (loading) return <LoadingScreen />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Your cart is empty"
        message="Add items from the menu to get started"
        actionLabel="Browse Food"
        onAction={() => navigation.navigate('Home')}
      />
    );
  }

  const handleClear = () =>
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {caterer && (
        <Text style={styles.catererLabel}>From: {caterer.name}</Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => i._id ?? i.foodId}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateItem(item.foodId ?? item._id, item.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateItem(item.foodId ?? item._id, item.quantity + 1)}
              >
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
          <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery fee</Text>
          <Text style={styles.summaryValue}>₹30</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{(total + 30).toFixed(2)}</Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.background },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg },
  title:         { fontSize: 22, fontWeight: '700', color: COLORS.text },
  clearText:     { color: COLORS.error, fontSize: 14 },
  catererLabel:  { paddingHorizontal: SIZES.lg, color: COLORS.muted, marginBottom: SIZES.sm },
  item:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, marginHorizontal: SIZES.lg, marginBottom: SIZES.sm, padding: SIZES.md, borderRadius: 12 },
  itemInfo:      { flex: 1 },
  itemName:      { fontSize: 15, fontWeight: '600', color: COLORS.text },
  itemPrice:     { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  qtyRow:        { flexDirection: 'row', alignItems: 'center' },
  qtyBtn:        { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  qty:           { fontSize: 16, fontWeight: '600', color: COLORS.text, marginHorizontal: 12 },
  summary:       { backgroundColor: COLORS.surface, padding: SIZES.lg, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  summaryLabel:  { fontSize: 14, color: COLORS.muted },
  summaryValue:  { fontSize: 14, color: COLORS.text },
  totalRow:      { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginBottom: SIZES.md },
  totalLabel:    { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue:    { fontSize: 18, fontWeight: '700', color: COLORS.primary },
});
