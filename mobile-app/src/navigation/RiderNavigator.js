import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

import DashboardScreen      from '../screens/rider/DashboardScreen';
import DeliveriesScreen     from '../screens/rider/DeliveriesScreen';
import DeliveryDetailScreen from '../screens/rider/DeliveryDetailScreen';
import ActiveBatchScreen    from '../screens/rider/ActiveBatchScreen';
import EarningsScreen       from '../screens/rider/EarningsScreen';
import ProfileScreen        from '../screens/rider/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RiderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard:  'home-outline',
            Deliveries: 'bicycle-outline',
            Earnings:   'cash-outline',
            Profile:    'person-outline',
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
      <Tab.Screen name="Dashboard"  component={DashboardScreen} />
      <Tab.Screen name="Deliveries" component={DeliveriesScreen} />
      <Tab.Screen name="Earnings"   component={EarningsScreen} />
      <Tab.Screen name="Profile"    component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RiderNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="RiderTabs"      component={RiderTabs} />
      <Stack.Screen name="RiderDeliveries" component={DeliveriesScreen}    options={{ headerShown: true, title: 'Deliveries',      headerTintColor: COLORS.primary }} />
      <Stack.Screen name="DeliveryDetail"  component={DeliveryDetailScreen} options={{ headerShown: true, title: 'Delivery Details', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="ActiveBatch"     component={ActiveBatchScreen}    options={{ headerShown: true, title: 'Active Batch',     headerTintColor: COLORS.primary }} />
    </Stack.Navigator>
  );
}
