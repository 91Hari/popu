import { registerRootComponent } from 'expo';
import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider }   from './src/contexts/AuthContext';
import { CartProvider }   from './src/contexts/CartContext';
import RootNavigator      from './src/navigation/RootNavigator';

// Register background location task before any UI renders
import './src/services/locationService';

// Keep splash visible until the root view lays out
SplashScreen.preventAutoHideAsync().catch(() => {});

function App() {
  const [ready, setReady] = useState(false);

  const onRootLayout = useCallback(async () => {
    if (!ready) {
      setReady(true);
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onRootLayout}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#1B5E20" translucent={false} />
        <AuthProvider>
          <CartProvider>
            <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
