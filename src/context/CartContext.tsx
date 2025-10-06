import { createContext, useEffect, useReducer } from "react";
import type { ReactNode } from "react";
import type { CartContextType, CartItem } from "../types/cart";
import type { Product } from "../types/product";
import { cartReducer } from "../store/cart/cartReducer";

import { calculateTotalQuantity, calculateTotalPrice } from "../store/cart/cartSelectors";
import { addToCartAction, clearCartAction, removeFromCartAction } from "../actions/cartActions";

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
    dispatch(addToCartAction(product, quantity));
  };

  const removeFromCart = (productId: number): void => {
    dispatch(removeFromCartAction(productId));
  };

  const clearCart = (): void => {
    dispatch(clearCartAction());
  };

  const totalQuantity = calculateTotalQuantity(cart);
  const totalPrice = calculateTotalPrice(cart); // CALCUL DE totalPrice

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        totalQuantity,
        totalPrice // INCLUS dans la valeur du context
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export { CartContext };