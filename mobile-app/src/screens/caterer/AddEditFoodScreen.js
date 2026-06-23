import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import foodService from '../../services/foodService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AddEditFoodScreen({ route, navigation }) {
  const existing = route.params?.food;
  const [form, setForm] = useState({
    name:        existing?.name        ?? '',
    description: existing?.description ?? '',
    price:       existing?.price?.toString() ?? '',
    category:    existing?.category    ?? '',
    available:   existing?.available   ?? true,
    image:       null,
  });
  const [imageUri, setImageUri] = useState(existing?.imageUrl ?? existing?.image ?? null);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const set = (field) => (v) => setForm(f => ({ ...f, [field]: v }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
      setForm(f => ({ ...f, image: result.assets[0].uri }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.price)        e.price = 'Price is required';
    else if (isNaN(+form.price)) e.price = 'Enter a valid price';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, price: +form.price };
      let saved;
      if (existing) {
        saved = await foodService.updateFood(existing._id, payload);
      } else {
        saved = await foodService.createFood(payload);
      }
      if (form.image && saved?._id) {
        await foodService.uploadFoodImage(saved._id, form.image).catch(() => {});
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.message ?? 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{existing ? 'Edit Item' : 'Add Menu Item'}</Text>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={32} color={COLORS.muted} />
            <Text style={styles.imageHint}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input label="Item Name"    placeholder="e.g. Butter Chicken"    value={form.name}        onChangeText={set('name')}        error={errors.name} />
      <Input label="Description"  placeholder="Short description..."   value={form.description} onChangeText={set('description')} multiline />
      <Input label="Price (₹)"    placeholder="e.g. 150"              value={form.price}       onChangeText={set('price')}       error={errors.price} keyboardType="numeric" />
      <Input label="Category"     placeholder="e.g. Lunch"            value={form.category}    onChangeText={set('category')} />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Available</Text>
        <Switch
          value={form.available}
          onValueChange={set('available')}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor="#fff"
        />
      </View>

      <Button title={existing ? 'Save Changes' : 'Add Item'} onPress={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  content:        { padding: SIZES.lg, paddingBottom: SIZES.xl * 2 },
  title:          { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.lg },
  imagePicker:    { borderRadius: 12, overflow: 'hidden', marginBottom: SIZES.md },
  image:          { width: '100%', height: 180 },
  imagePlaceholder:{ width: '100%', height: 180, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.border },
  imageHint:      { color: COLORS.muted, marginTop: 8 },
  switchRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  switchLabel:    { fontSize: 14, fontWeight: '500', color: COLORS.text },
});
