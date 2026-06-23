import React, { createContext, useContext, useReducer, useCallback } from 'react';
import orderService from '../services/orderService';

const CartContext = createContext(null);

const initialState = { items: [], total: 0, caterer: null, loading: false };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CART': {
      const items = action.cart?.items ?? [];
      const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
      return { ...state, items, total, caterer: action.cart?.caterer ?? null, loading: false };
    }
    case 'CLEAR':
      return { ...initialState, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchCart = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const cart = await orderService.getCart();
      dispatch({ type: 'SET_CART', cart });
    } catch {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  const addItem = async (foodId, qty = 1) => {
    await orderService.addToCart(foodId, qty);
    await fetchCart();
  };

  const updateItem = async (foodId, qty) => {
    if (qty <= 0) {
      await orderService.removeFromCart(foodId);
    } else {
      await orderService.updateCartItem(foodId, qty);
    }
    await fetchCart();
  };

  const removeItem = async (foodId) => {
    await orderService.removeFromCart(foodId);
    await fetchCart();
  };

  const clearCart = async () => {
    await orderService.clearCart();
    dispatch({ type: 'CLEAR' });
  };

  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, itemCount, fetchCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
