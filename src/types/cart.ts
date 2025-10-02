import type { Product } from "./product";

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  totalQuantity: number;
}

export const ADD_TO_CART = "ADD_TO_CART" as const;
export const REMOVE_FROM_CART = "REMOVE_FROM_CART" as const;
export const CLEAR_CART = "CLEAR_CART" as const;

export type CartAction =
  | { type: typeof ADD_TO_CART; payload: { product: Product; quantity: number } }
  | { type: typeof REMOVE_FROM_CART; payload: { productId: number } }
  | { type: typeof CLEAR_CART };

export const cartReducer = (prevCart: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case ADD_TO_CART: {
      const { product, quantity } = action.payload;
      const existingItem = prevCart.find(
        (item) => item.productId === product.productId
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    }

    case REMOVE_FROM_CART:
      return prevCart.filter(
        (item) => item.productId !== action.payload.productId
      );

    case CLEAR_CART:
      return [];

    default:
      return prevCart;
  }
};