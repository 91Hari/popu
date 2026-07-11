import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import cartApi from "../services/cartService";

const CART_LOCAL_KEY = "popu_cart_local";

const CartContext = createContext(null);

const initialState = { items: [], total: 0, loading: false };

function reducer(state, action) {
  switch (action.type) {
    case "SET":     return { ...state, items: action.items, total: action.total, loading: false };
    case "LOADING": return { ...state, loading: true };
    case "IDLE":    return { ...state, loading: false };
    default:        return state;
  }
}

/** Persist cart to localStorage for offline fallback */
function persistCart(items) {
  try {
    localStorage.setItem(CART_LOCAL_KEY, JSON.stringify(items));
  } catch { /* QuotaExceededError — silent */ }
}

/** Load cart from localStorage (returns [] on failure) */
function loadPersistedCart() {
  try {
    const raw = localStorage.getItem(CART_LOCAL_KEY);
    if (!raw) return null;
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Flag: true if cart was loaded from device cache (API was offline)
  const [isOfflineCart, setIsOfflineCart] = useState(false);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      dispatch({ type: "SET", items: [], total: 0 });
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role && user.role.toLowerCase() !== "customer") {
        dispatch({ type: "SET", items: [], total: 0 });
        return;
      }
    } catch { /* ignore parse errors */ }

    try {
      const data = await cartApi.getCart();
      const items = data.items || [];
      dispatch({ type: "SET", items, total: data.total || 0 });
      persistCart(items);
      setIsOfflineCart(false);
    } catch {
      // API failed — try local cache
      const cached = loadPersistedCart();
      if (cached && cached.length > 0) {
        const total = cached.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
        dispatch({ type: "SET", items: cached, total });
        setIsOfflineCart(true);
      } else {
        dispatch({ type: "SET", items: [], total: 0 });
        setIsOfflineCart(false);
      }
    }
  }, []);

  // Sync persisted cart whenever items change
  useEffect(() => {
    if (state.items.length > 0 && !isOfflineCart) {
      persistCart(state.items);
    }
  }, [state.items, isOfflineCart]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    let cleanup = () => {};
    import('@capacitor/app').then(({ App }) => {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) refresh();
      }).then((listener) => {
        cleanup = () => listener.remove();
      });
    }).catch(() => {});
    return () => cleanup();
  }, [refresh]);

  const addToCart = async (foodItemId, quantity = 1) => {
    dispatch({ type: "LOADING" });
    await cartApi.addItem(foodItemId, quantity);
    await refresh();
  };

  const updateQty = async (cartItemId, quantity) => {
    dispatch({ type: "LOADING" });
    if (Number(quantity) < 1) {
      await cartApi.removeItem(cartItemId);
    } else {
      await cartApi.updateItem(cartItemId, quantity);
    }
    await refresh();
  };

  const removeFromCart = async (cartItemId) => {
    dispatch({ type: "LOADING" });
    await cartApi.removeItem(cartItemId);
    await refresh();
  };

  const clearCart = async () => {
    dispatch({ type: "LOADING" });
    await cartApi.clearCart();
    try { localStorage.removeItem(CART_LOCAL_KEY); } catch { /* silent */ }
    dispatch({ type: "SET", items: [], total: 0 });
    setIsOfflineCart(false);
  };

  const cartCount = state.items.reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      items:          state.items,
      total:          state.total,
      cartCount,
      loading:        state.loading,
      isOfflineCart,
      refresh,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
