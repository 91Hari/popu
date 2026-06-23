import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, TextInput, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { COLORS, SIZES } from '../../config/theme';
import foodService from '../../services/foodService';
import catererService from '../../services/catererService';
import FoodCard from '../../components/common/FoodCard';
import LoadingScreen from '../../components/common/LoadingScreen';

const CATEGORIES = ['All', 'Lunch', 'Dinner', 'Breakfast', 'Snacks', 'Beverages'];

export default function HomeScreen({ navigation }) {
  const { user }           = useAuth();
  const { addItem, items } = useCart();
  const [foods, setFoods]           = useState([]);
  const [caterers, setCaterers]     = useState([]);
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, c] = await Promise.all([
        foodService.getAllFoods({ category: category !== 'All' ? category : undefined, limit: 20 }),
        catererService.getAllCaterers({ limit: 10 }),
      ]);
      setFoods(Array.isArray(f) ? f : f?.foods ?? []);
      setCaterers(Array.isArray(c) ? c : c?.caterers ?? []);
    } catch {}
  }, [category]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const cartQty = (foodId) => items.find(i => i.foodId === foodId || i._id === foodId)?.quantity ?? 0;

  if (loading) return <LoadingScreen />;

  const filtered = search
    ? foods.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()))
    : foods;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text style={styles.subGreeting}>What are you craving today?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search food, caterers..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          onFocus={() => navigation.navigate('Search')}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nearby Caterers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Caterers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CatererList')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {caterers.slice(0, 6).map(c => (
            <TouchableOpacity
              key={c._id}
              style={styles.catererCard}
              onPress={() => navigation.navigate('CatererDetail', { catererId: c._id })}
            >
              <View style={styles.catererAvatar}>
                <Text style={styles.catererInitial}>{c.name?.[0] ?? 'C'}</Text>
              </View>
              <Text style={styles.catererName} numberOfLines={1}>{c.name}</Text>
              <Text style={styles.catererRating}>⭐ {c.rating?.toFixed(1) ?? '4.5'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Foods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {category === 'All' ? 'Popular Dishes' : category}
        </Text>
        {filtered.map(food => (
          <FoodCard
            key={food._id}
            food={food}
            cartQty={cartQty(food._id)}
            onPress={() => navigation.navigate('FoodDetail', { foodId: food._id })}
            onAddToCart={() => addItem(food._id, 1).catch(() => {})}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SIZES.lg, paddingTop: SIZES.xl },
  greeting:       { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subGreeting:    { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  searchRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, margin: SIZES.lg, marginTop: 0, borderRadius: 12, paddingHorizontal: SIZES.md },
  searchIcon:     { marginRight: 8 },
  searchInput:    { flex: 1, height: 46, color: COLORS.text, fontSize: 15 },
  categories:     { paddingLeft: SIZES.lg, marginBottom: SIZES.md },
  catChip:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  catChipActive:  { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText:        { fontSize: 13, color: COLORS.text },
  catTextActive:  { color: '#fff', fontWeight: '600' },
  section:        { padding: SIZES.lg, paddingTop: 0 },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  sectionTitle:   { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
  seeAll:         { color: COLORS.primary, fontSize: 14 },
  catererCard:    { alignItems: 'center', marginRight: SIZES.md, width: 80 },
  catererAvatar:  { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catererInitial: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  catererName:    { fontSize: 11, color: COLORS.text, textAlign: 'center' },
  catererRating:  { fontSize: 11, color: COLORS.muted },
});
