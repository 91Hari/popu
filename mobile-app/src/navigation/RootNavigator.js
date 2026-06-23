import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator     from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import CatererNavigator  from './CatererNavigator';
import RiderNavigator    from './RiderNavigator';
import AdminNavigator    from './AdminNavigator';
import LoadingScreen     from '../components/common/LoadingScreen';
import notificationService from '../services/notificationService';

const ROLE_NAVIGATOR = {
  customer: CustomerNavigator,
  caterer:  CatererNavigator,
  rider:    RiderNavigator,
  admin:    AdminNavigator,
};

export default function RootNavigator() {
  const { token, role, loading } = useAuth();
  const navRef = useRef(null);

  // Handle deep links from notification taps
  useEffect(() => {
    const sub = notificationService.addResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (!navRef.current || !data) return;

      if (data.orderId) {
        navRef.current.navigate('OrderDetail', { orderId: data.orderId });
      } else if (data.screen) {
        navRef.current.navigate(data.screen, data.params);
      }
    });
    return () => notificationService.removeListener(sub);
  }, []);

  if (loading) return <LoadingScreen message="Starting PO.PU..." />;

  if (!token)  return (
    <NavigationContainer ref={navRef}>
      <AuthNavigator />
    </NavigationContainer>
  );

  const AppNavigator = ROLE_NAVIGATOR[role] ?? CustomerNavigator;

  return (
    <NavigationContainer ref={navRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}
