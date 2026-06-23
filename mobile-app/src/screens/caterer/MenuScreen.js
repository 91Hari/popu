import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import foodService from '../../services/foodService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export default function CatererMenuScreen({ navigation }) {
  const [foods, setFoods]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await foodService.getCatererFoods();
      setFoods(Array.isArray(data) ? data : data?.foods ?? []);
    } catch { setFoods([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const toggleAvailability = async (id, current) => {
    await foodService.toggleAvailability(id, !current).catch(() => {});
    setFoods(prev => prev.map(f => f._id === id ? { ...f, available: !current } : f));
  };

  const handleDelete = (id) =>
    Alert.alert('Delete Item', 'Remove this menu item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await foodService.deleteFood(id).catch(() => {});
          setFoods(prev => prev.filter(f => f._id !== id));
        }
      },
    ]);

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {foods.length === 0 ? (
        <EmptyState
          icon="fast-food-outline"
          title="No menu items"
          message="Add your first dish to get started"
          actionLabel="Add Item"
          onAction={() => navigation.navigate('AddEditFood')}
        />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={f => f._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>
              <View style={styles.actions}>
                <Switch
                  value={item.available !== false}
                  onValueChange={() => toggleAvailability(item._id, item.available !== false)}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#fff"
                />
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('AddEditFood', { food: item })}>
                  <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item._id)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabBtn}
          onPress={() => navigation.navigate('AddEditFood')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list:      { padding: SIZES.lg, paddingBottom: 100 },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: SIZES.md, marginBottom: SIZES.sm },
  info:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '600', color: COLORS.text },
  price:     { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  actions:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn:   { padding: 4 },
  fab:       { position: 'absolute', bottom: SIZES.xl, right: SIZES.lg },
  fabBtn:    { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', elevation: 6 },
});
