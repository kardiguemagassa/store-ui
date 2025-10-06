import type { Product } from "../types/product";

// Action Types
export const ADD_TO_CART = "ADD_TO_CART" as const;
export const REMOVE_FROM_CART = "REMOVE_FROM_CART" as const;
export const CLEAR_CART = "CLEAR_CART" as const;

// Action Creators
export const addToCartAction = (product: Product, quantity: number) => ({
  type: ADD_TO_CART as typeof ADD_TO_CART,
  payload: { product, quantity }
});

export const removeFromCartAction = (productId: number) => ({
  type: REMOVE_FROM_CART as typeof REMOVE_FROM_CART,
  payload: { productId }
});

export const clearCartAction = () => ({
  type: CLEAR_CART as typeof CLEAR_CART
});

// Action Types Union
export type CartAction =
  | ReturnType<typeof addToCartAction>
  | ReturnType<typeof removeFromCartAction>
  | ReturnType<typeof clearCartAction>;