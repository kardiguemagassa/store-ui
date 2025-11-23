import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { Product } from "../../products/types/product.types";
import type { CartItem } from "../../payment/types/payment.pytes";

// CART SLICE - VERSION 4.0 REDUX PERSIST COMPATIBLE

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

// INITIAL STATE
const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

// HELPER FUNCTIONS
const calculateTotals = (items: CartItem[]): Pick<CartState, 'totalQuantity' | 'totalPrice'> => {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  
  return { totalQuantity, totalPrice };
};

// Fonction pour convertir Product en CartItem
const productToCartItem = (product: Product, quantity: number): CartItem => {
  return {
    productId: product.productId,
    quantity,
    price: product.price,
    name: product.name || '',
    description: product.description || '',
    imageUrl: product.imageUrl || undefined, // Convert null to undefined
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    sku: product.sku,
    stockQuantity: product.stockQuantity
  };
};

// SLICE
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Ajouter un produit au panier
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.productId === product.productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Utiliser la fonction de conversion
        const cartItem = productToCartItem(product, quantity);
        state.items.push(cartItem);
      }
      
      //Recalculer les totaux
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
    },
    
    // Retirer un produit du panier
    removeFromCart: (state, action: PayloadAction<{ productId: number }>) => {
      state.items = state.items.filter(item => item.productId !== action.payload.productId);
      
      // Recalculer les totaux
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
    },
    
    // Vider complètement le panier
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
    
    // Modifier la quantité d'un produit
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        item.quantity = quantity;
        
        // Recalculer les totaux
        const totals = calculateTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalPrice = totals.totalPrice;
      }
    },
  }
});

// EXPORTS
export const { 
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectTotalQuantity = (state: { cart: CartState }) => state.cart.totalQuantity;
export const selectTotalPrice = (state: { cart: CartState }) => state.cart.totalPrice;
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.items.length;
export const selectItemQuantity = (productId: number) => 
  (state: { cart: CartState }) => 
    state.cart.items.find(item => item.productId === productId)?.quantity || 0;

export default cartSlice.reducer;