import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';
import { useCart } from '../contexts/CartContext';
import { View, Text, StyleSheet } from 'react-native';

// Screens
import HomeScreen            from '../screens/customer/HomeScreen';
import SearchScreen          from '../screens/customer/SearchScreen';
import CartScreen            from '../screens/customer/CartScreen';
import OrdersScreen          from '../screens/customer/OrdersScreen';
import ProfileScreen         from '../screens/customer/ProfileScreen';
import FoodDetailScreen      from '../screens/customer/FoodDetailScreen';
import CatererDetailScreen   from '../screens/customer/CatererDetailScreen';
import CatererListScreen     from '../screens/customer/CatererListScreen';
import CheckoutScreen        from '../screens/customer/CheckoutScreen';
import OrderConfirmationScreen from '../screens/customer/OrderConfirmationScreen';
import OrderDetailScreen     from '../screens/customer/OrderDetailScreen';
import TrackOrderScreen      from '../screens/customer/TrackOrderScreen';
import NotificationsScreen   from '../screens/customer/NotificationsScreen';
import AddressesScreen       from '../screens/customer/AddressesScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CartTabIcon({ color, size }) {
  const { itemCount } = useCart();
  return (
    <View>
      <Ionicons name="cart-outline" size={size} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge:     { position: 'absolute', top: -4, right: -8, backgroundColor: COLORS.error, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = { Home: 'home-outline', Search: 'search-outline', Cart: '', Orders: 'receipt-outline', Profile: 'person-outline' };
          if (route.name === 'Cart') return <CartTabIcon color={color} size={size} />;
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        headerShown: false,
        tabBarStyle:  { borderTopWidth: 0, elevation: 8, shadowOpacity: 0.1 },
        tabBarLabelStyle: { fontSize: 11 },
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Search"  component={SearchScreen} />
      <Tab.Screen name="Cart"    component={CartScreen} />
      <Tab.Screen name="Orders"  component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="CustomerTabs"       component={CustomerTabs} />
      <Stack.Screen name="FoodDetail"         component={FoodDetailScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="CatererDetail"      component={CatererDetailScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="CatererList"        component={CatererListScreen} options={{ headerShown: true, title: 'Caterers' }} />
      <Stack.Screen name="Checkout"           component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="OrderConfirmation"  component={OrderConfirmationScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="OrderDetail"        component={OrderDetailScreen} options={{ headerShown: true, title: 'Order Details', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="TrackOrder"         component={TrackOrderScreen} options={{ headerShown: true, title: 'Track Order', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="Notifications"      component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications', headerTintColor: COLORS.primary }} />
      <Stack.Screen name="Addresses"          component={AddressesScreen} options={{ headerShown: true, title: 'My Addresses', headerTintColor: COLORS.primary }} />
    </Stack.Navigator>
  );
}
