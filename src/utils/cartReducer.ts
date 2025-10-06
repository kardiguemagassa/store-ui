import { ADD_TO_CART, CLEAR_CART, REMOVE_FROM_CART, type CartAction } from "../actions/cartActions";
import type { CartItem } from "../types/cart";


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