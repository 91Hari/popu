import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

import DashboardScreen     from '../screens/admin/DashboardScreen';
import UsersScreen         from '../screens/admin/UsersScreen';
import OrdersScreen        from '../screens/admin/OrdersScreen';
import NotificationsScreen from '../screens/admin/NotificationsScreen';
import SettingsScreen      from '../screens/admin/SettingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'grid-outline',
            Users:     'people-outline',
            Orders:    'receipt-outline',
            Push:      'notifications-outline',
            Settings:  'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        headerShown:  false,
        tabBarStyle:  { borderTopWidth: 0, elevation: 8 },
        tabBarLabelStyle: { fontSize: 11 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Users"     component={UsersScreen} />
      <Tab.Screen name="Orders"    component={OrdersScreen} />
      <Tab.Screen name="Push"      component={NotificationsScreen} />
      <Tab.Screen name="Settings"  component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="AdminTabs"          component={AdminTabs} />
      <Stack.Screen name="AdminCustomers"     component={UsersScreen}   options={{ headerShown: true, title: 'Customers',     headerTintColor: COLORS.primary }} />
      <Stack.Screen name="AdminCaterers"      component={UsersScreen}   options={{ headerShown: true, title: 'Caterers',      headerTintColor: COLORS.primary }} />
      <Stack.Screen name="AdminOrders"        component={OrdersScreen}  options={{ headerShown: true, title: 'All Orders',    headerTintColor: COLORS.primary }} />
      <Stack.Screen name="AdminPayments"      component={SettingsScreen} options={{ headerShown: true, title: 'Payments',     headerTintColor: COLORS.primary }} />
      <Stack.Screen name="AdminNotifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="AdminSettings"      component={SettingsScreen} options={{ headerShown: true, title: 'Settings',    headerTintColor: COLORS.primary }} />
    </Stack.Navigator>
  );
}
