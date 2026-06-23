import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../config/theme';

export default function FoodCard({ food, onPress, onAddToCart, cartQty = 0 }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: food.imageUrl || food.image }}
        style={styles.image}
        defaultSource={require('../../assets/placeholder-food.png')}
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>{food.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>₹{food.price}</Text>
          {food.available !== false ? (
            cartQty > 0 ? (
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{cartQty} added</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart?.(food)}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            )
          ) : (
            <Text style={styles.unavailable}>Unavailable</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    backgroundColor: COLORS.surface,
    borderRadius:    16,
    marginBottom:    SIZES.md,
    overflow:        'hidden',
    ...SHADOWS.small,
  },
  image:  { width: 100, height: 100 },
  body:   { flex: 1, padding: SIZES.sm },
  name:   { fontSize: 15, fontWeight: '600', color: COLORS.text },
  desc:   { fontSize: 12, color: COLORS.muted, marginTop: 2, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SIZES.sm },
  price:  { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius:    20,
    padding:         4,
  },
  qtyBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius:    12,
    paddingHorizontal: 8,
    paddingVertical:   2,
  },
  qtyText:    { fontSize: 11, color: '#fff', fontWeight: '600' },
  unavailable:{ fontSize: 12, color: COLORS.muted },
});
