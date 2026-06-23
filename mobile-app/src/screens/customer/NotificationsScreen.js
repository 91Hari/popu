import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/theme';
import notificationService from '../../services/notificationService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EmptyState from '../../components/common/EmptyState';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : data?.notifications ?? []);
    } catch { setNotifications([]); }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const markRead = async (id) => {
    await notificationService.markRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading)  return <LoadingScreen />;
  if (notifications.length === 0) return (
    <EmptyState icon="notifications-off-outline" title="No notifications" message="You're all caught up!" />
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.markAll} onPress={markAllRead}>
        <Text style={styles.markAllText}>Mark all as read</Text>
      </TouchableOpacity>
      <FlatList
        data={notifications}
        keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.isRead && styles.unread]}
            onPress={() => markRead(item._id)}
          >
            <View style={[styles.dot, { backgroundColor: item.isRead ? 'transparent' : COLORS.primary }]} />
            <View style={styles.itemContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{item.body ?? item.message}</Text>
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  markAll:      { alignItems: 'flex-end', padding: SIZES.md },
  markAllText:  { color: COLORS.primary, fontSize: 13 },
  item:         { flexDirection: 'row', alignItems: 'flex-start', padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  unread:       { backgroundColor: COLORS.accent },
  dot:          { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 10 },
  itemContent:  { flex: 1 },
  title:        { fontSize: 14, fontWeight: '700', color: COLORS.text },
  body:         { fontSize: 13, color: COLORS.muted, marginTop: 2, lineHeight: 18 },
  time:         { fontSize: 11, color: COLORS.muted, marginTop: 4 },
});
