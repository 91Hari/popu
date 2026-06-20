import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import catererService from '../../services/catererService';
import foodService from '../../services/foodService';
import { useCart } from '../../contexts/CartContext';
import FoodCard from '../../components/common/FoodCard';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function CatererDetailScreen({ route, navigation }) {
  const { catererId } = route.params;
  const { addItem, items } = useCart();
  const [caterer, setCaterer] = useState(null);
  const [foods, setFoods]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      catererService.getCatererById(catererId),
      foodService.getAllFoods({ catererId, limit: 50 }),
    ]).then(([c, f]) => {
      setCaterer(c);
      setFoods(Array.isArray(f) ? f : f?.foods ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [catererId]);

  if (loading) return <LoadingScreen />;
  if (!caterer) return null;

  const cartQty = (foodId) => items.find(i => i.foodId === foodId || i._id === foodId)?.quantity ?? 0;

  return (
    <ScrollView style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroAvatar}>
          <Text style={styles.heroInitial}>{caterer.name?.[0] ?? 'C'}</Text>
        </View>
        <Text style={styles.name}>{caterer.name}</Text>
        <Text style={styles.cuisine}>{caterer.cuisine ?? caterer.category ?? ''}</Text>
        <View style={styles.meta}>
          <Ionicons name="star" size={14} color={COLORS.secondary} />
          <Text style={styles.rating}>{caterer.rating?.toFixed(1) ?? '4.5'}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={[styles.openStatus, { color: caterer.isOpen ? COLORS.primary : COLORS.error }]}>
            {caterer.isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
        {caterer.description && (
          <Text style={styles.desc}>{caterer.description}</Text>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <Text style={styles.sectionTitle}>Menu ({foods.length} items)</Text>
        {foods.map(food => (
          <FoodCard
            key={food._id}
            food={food}
            cartQty={cartQty(food._id)}
            onPress={() => navigation.navigate('FoodDetail', { foodId: food._id })}
            onAddToCart={() => addItem(food._id, 1).catch(() => {})}
          />
        ))}
        {foods.length === 0 && (
          <Text style={styles.noMenu}>No menu items available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },
  hero:        { alignItems: 'center', backgroundColor: COLORS.surface, padding: SIZES.xl },
  heroAvatar:  { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.md },
  heroInitial: { fontSize: 36, fontWeight: '700', color: COLORS.primary },
  name:        { fontSize: 22, fontWeight: '700', color: COLORS.text },
  cuisine:     { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  meta:        { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.sm },
  rating:      { fontSize: 13, color: COLORS.text, marginLeft: 4 },
  dot:         { color: COLORS.muted, marginHorizontal: 6 },
  openStatus:  { fontSize: 13, fontWeight: '600' },
  desc:        { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: SIZES.sm, lineHeight: 20 },
  menu:        { padding: SIZES.lg },
  sectionTitle:{ fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  noMenu:      { textAlign: 'center', color: COLORS.muted, marginTop: SIZES.xl },
});
