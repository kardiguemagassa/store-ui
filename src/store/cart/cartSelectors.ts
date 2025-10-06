import type { CartItem } from "../../types/cart";

export const calculateTotalQuantity = (cart: CartItem[]): number => {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
};

export const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

export const getCartItemCount = (cart: CartItem[], productId: number): number => {
  const item = cart.find(item => item.productId === productId);
  return item ? item.quantity : 0;
};