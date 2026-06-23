import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import foodService from '../../services/foodService';
import { useCart } from '../../contexts/CartContext';
import LoadingScreen from '../../components/common/LoadingScreen';
import Button from '../../components/common/Button';

export default function FoodDetailScreen({ route, navigation }) {
  const { foodId } = route.params;
  const { addItem, items } = useCart();
  const [food, setFood]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    foodService.getFoodById(foodId)
      .then(setFood)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [foodId]);

  if (loading) return <LoadingScreen />;
  if (!food)   return null;

  const cartItem = items.find(i => i.foodId === foodId || i._id === foodId);
  const qty      = cartItem?.quantity ?? 0;

  const handleAdd = async () => {
    setAdding(true);
    try { await addItem(food._id, 1); } catch {} finally { setAdding(false); }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={{ uri: food.imageUrl ?? food.image }}
          style={styles.image}
          defaultSource={require('../../assets/placeholder-food.png')}
        />

        <View style={styles.body}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{food.name}</Text>
              {food.available === false && (
                <View style={styles.unavailBadge}>
                  <Text style={styles.unavailText}>Unavailable</Text>
                </View>
              )}
            </View>
            <Text style={styles.price}>₹{food.price}</Text>
          </View>

          {food.caterer && (
            <TouchableOpacity
              style={styles.catererRow}
              onPress={() => navigation.navigate('CatererDetail', { catererId: food.caterer._id ?? food.catererId })}
            >
              <Ionicons name="storefront-outline" size={14} color={COLORS.primary} />
              <Text style={styles.catererName}>{food.caterer.name ?? 'Unknown Caterer'}</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.muted} />
            </TouchableOpacity>
          )}

          {food.description && (
            <Text style={styles.desc}>{food.description}</Text>
          )}

          {/* Nutritional info if available */}
          {food.calories && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>{food.calories} kcal</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to cart CTA */}
      {food.available !== false && (
        <View style={styles.cta}>
          {qty > 0 ? (
            <TouchableOpacity
              style={styles.viewCart}
              onPress={() => navigation.navigate('Cart')}
            >
              <Text style={styles.viewCartText}>{qty} in cart — View Cart</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <Button title="Add to Cart" onPress={handleAdd} loading={adding} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  image:          { width: '100%', height: 240, backgroundColor: COLORS.border },
  body:           { padding: SIZES.lg },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.md },
  titleRow:       { flex: 1 },
  name:           { fontSize: 22, fontWeight: '700', color: COLORS.text },
  price:          { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  unavailBadge:   { backgroundColor: COLORS.muted, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  unavailText:    { fontSize: 11, color: '#fff' },
  catererRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  catererName:    { fontSize: 14, color: COLORS.primary, marginHorizontal: 4 },
  desc:           { fontSize: 14, color: COLORS.muted, lineHeight: 22, marginBottom: SIZES.md },
  nutritionRow:   { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm },
  nutritionLabel: { fontSize: 13, color: COLORS.muted },
  nutritionValue: { fontSize: 13, color: COLORS.text },
  cta:            { padding: SIZES.lg, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  viewCart:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, height: 50, gap: 8 },
  viewCartText:   { color: '#fff', fontSize: 15, fontWeight: '600' },
});
