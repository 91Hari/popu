import React, { createContext, useContext, useEffect, useReducer } from 'react';
import authService from '../services/authService';
import notificationService from '../services/notificationService';

const AuthContext = createContext(null);

const initialState = {
  token:   null,
  user:    null,
  role:    null,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return {
        ...state,
        token:   action.token,
        user:    action.user,
        role:    action.user?.role ?? null,
        loading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        token: action.token,
        user:  action.user,
        role:  action.user?.role ?? null,
      };
    case 'SIGN_OUT':
      return { ...initialState, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.updates } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore session from SecureStore on cold launch
  useEffect(() => {
    (async () => {
      try {
        const session = await authService.getStoredSession();
        dispatch({ type: 'RESTORE', token: session?.token ?? null, user: session?.user ?? null });
      } catch {
        dispatch({ type: 'RESTORE', token: null, user: null });
      }
    })();
  }, []);

  // Register FCM after sign-in
  useEffect(() => {
    if (state.token) {
      notificationService.register().catch(() => {});
    }
  }, [state.token]);

  const signIn = async (username, password) => {
    const { token, user } = await authService.login(username, password);
    dispatch({ type: 'SIGN_IN', token, user });
    return user;
  };

  const signUp = async (payload) => {
    const { token, user } = await authService.register(payload);
    dispatch({ type: 'SIGN_IN', token, user });
    return user;
  };

  const signOut = async () => {
    await authService.logout();
    dispatch({ type: 'SIGN_OUT' });
  };

  const updateUser = (updates) => dispatch({ type: 'UPDATE_USER', updates });

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
