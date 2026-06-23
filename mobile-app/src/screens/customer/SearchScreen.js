import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  FlatList, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import foodService from '../../services/foodService';
import FoodCard from '../../components/common/FoodCard';
import { useCart } from '../../contexts/CartContext';

export default function SearchScreen({ navigation }) {
  const { addItem, items } = useCart();
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await foodService.searchFoods(q);
      const list = Array.isArray(data) ? data : data?.foods ?? data?.results ?? [];
      setResults(list);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  const cartQty = (foodId) => items.find(i => i.foodId === foodId || i._id === foodId)?.quantity ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TextInput
          autoFocus
          style={styles.input}
          placeholder="Search food, dishes..."
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={setQuery}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && <Text style={styles.hint}>Searching...</Text>}

      {!loading && query && results.length === 0 && (
        <Text style={styles.hint}>No results for "{query}"</Text>
      )}

      {!query && (
        <Text style={styles.hint}>Start typing to search for food</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FoodCard
            food={item}
            cartQty={cartQty(item._id)}
            onPress={() => navigation.navigate('FoodDetail', { foodId: item._id })}
            onAddToCart={() => addItem(item._id, 1).catch(() => {})}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    margin:          SIZES.lg,
    marginTop:       SIZES.xl,
    borderRadius:    12,
    paddingHorizontal: SIZES.md,
  },
  backBtn: { marginRight: 8 },
  input:   { flex: 1, height: 46, color: COLORS.text, fontSize: 15 },
  hint:    { textAlign: 'center', color: COLORS.muted, marginTop: SIZES.xl, fontSize: 14 },
  list:    { paddingHorizontal: SIZES.lg },
});
