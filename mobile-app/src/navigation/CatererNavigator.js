import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

import DashboardScreen  from '../screens/caterer/DashboardScreen';
import OrdersScreen     from '../screens/caterer/OrdersScreen';
import MenuScreen       from '../screens/caterer/MenuScreen';
import AddEditFoodScreen from '../screens/caterer/AddEditFoodScreen';
import RidersScreen     from '../screens/caterer/RidersScreen';
import EarningsScreen   from '../screens/caterer/EarningsScreen';
import ProfileScreen    from '../screens/caterer/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CatererTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'grid-outline',
            Orders:    'receipt-outline',
            Menu:      'fast-food-outline',
            Earnings:  'cash-outline',
            Profile:   'person-outline',
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
      <Tab.Screen name="Orders"    component={OrdersScreen} />
      <Tab.Screen name="Menu"      component={MenuScreen} />
      <Tab.Screen name="Earnings"  component={EarningsScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function CatererNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="CatererTabs"       component={CatererTabs} />
      <Stack.Screen name="CatererOrders"     component={OrdersScreen} options={{ headerShown: true, title: 'All Orders', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="CatererOrderDetail" component={OrdersScreen} options={{ headerShown: true, title: 'Order Detail', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="AddEditFood"       component={AddEditFoodScreen} options={{ headerShown: true, title: '', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="AddRider"          component={RidersScreen} options={{ headerShown: true, title: 'Add Rider', headerTintColor: COLORS.primary }} />
    </Stack.Navigator>
  );
}
