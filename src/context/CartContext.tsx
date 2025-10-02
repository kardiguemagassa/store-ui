import {
  createContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import type { Product } from "../types/product";
import type { CartItem, CartContextType } from "../types/cart";
import { ADD_TO_CART, REMOVE_FROM_CART, CLEAR_CART, cartReducer } from "../types/cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const initialCartState = (): CartItem[] => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  };

  const [cart, dispatch] = useReducer(cartReducer, [], initialCartState);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number): void => {
    dispatch({ type: ADD_TO_CART, payload: { product, quantity } });
  };

  const removeFromCart = (productId: number): void => {
    dispatch({ type: REMOVE_FROM_CART, payload: { productId } });
  };

  const clearCart = (): void => {
    dispatch({ type: CLEAR_CART });
  };

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Exporte le Context pour le hook
export { CartContext };