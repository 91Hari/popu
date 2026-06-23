import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import adminService from '../../services/adminService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

const TABS = ['customers', 'caterers', 'riders'];

export default function AdminUsersScreen() {
  const [tab, setTab]       = useState('customers');
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (t = tab) => {
    setLoading(true);
    try {
      let data;
      if (t === 'customers') data = await adminService.getCustomers();
      else if (t === 'caterers') data = await adminService.getCaterers();
      else data = await adminService.getRiders();
      setUsers(Array.isArray(data) ? data : data?.users ?? data?.caterers ?? data?.riders ?? []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const toggleStatus = async (id, current) => {
    const next = current === 'active' ? 'suspended' : 'active';
    try {
      if (tab === 'customers') await adminService.updateCustomerStatus(id, next);
      else if (tab === 'caterers') await adminService.updateCatererStatus(id, next);
      await load(tab);
    } catch { Alert.alert('Error', 'Failed to update status'); }
  };

  const filtered = search
    ? users.filter(u => (u.name ?? u.username ?? '').toLowerCase().includes(search.toLowerCase()))
    : users;

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="people-outline" title={`No ${tab} found`} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => u._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name ?? item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#F44336' }]}
                onPress={() => toggleStatus(item._id, item.status ?? 'active')}
              >
                <Text style={styles.statusText}>{item.status ?? 'active'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  tabs:         { flexDirection: 'row', padding: SIZES.md, gap: 8 },
  tab:          { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tabActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:      { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  tabTextActive:{ color: '#fff' },
  searchRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SIZES.md, marginBottom: SIZES.sm, borderRadius: 10, paddingHorizontal: SIZES.md },
  searchInput:  { flex: 1, height: 40, color: COLORS.text, fontSize: 14 },
  list:         { padding: SIZES.md },
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: SIZES.md, marginBottom: 8 },
  info:         { flex: 1 },
  name:         { fontSize: 14, fontWeight: '600', color: COLORS.text },
  email:        { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  statusBadge:  { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  statusText:   { fontSize: 11, color: '#fff', fontWeight: '600' },
});
