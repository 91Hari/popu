import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import cartApi from "../services/cartService";

const CartContext = createContext(null);

const initialState = { items: [], total: 0, loading: false };

function reducer(state, action) {
  switch (action.type) {
    case "SET":    return { ...state, items: action.items, total: action.total, loading: false };
    case "LOADING": return { ...state, loading: true };
    case "IDLE":   return { ...state, loading: false };
    default:       return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      dispatch({ type: "SET", items: [], total: 0 });
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role && user.role !== "CUSTOMER") {
        dispatch({ type: "SET", items: [], total: 0 });
        return;
      }
    } catch { /* ignore parse errors */ }
    try {
      const data = await cartApi.getCart();
      dispatch({ type: "SET", items: data.items || [], total: data.total || 0 });
    } catch {
      dispatch({ type: "SET", items: [], total: 0 });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

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
    dispatch({ type: "SET", items: [], total: 0 });
  };

  const cartCount = state.items.reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      items:          state.items,
      total:          state.total,
      cartCount,
      loading:        state.loading,
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
