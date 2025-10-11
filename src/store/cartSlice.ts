import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/product";
import { getErrorMessage } from "../types/errors";

// Fonction pour charger le panier depuis le localStorage
const getInitialCart = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Failed to parse cart from localStorage:", errorMessage);
    return [];
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: getInitialCart(),
  reducers: {
    // Ajouter un produit au panier
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItem = state.find(item => item.productId === product.productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.push({ ...product, quantity });
      }
      
      // Sauvegarde dans le localStorage
      try {
        localStorage.setItem("cart", JSON.stringify(state));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Failed to save cart to localStorage:", errorMessage);
      }
    },
    
    // Retirer un produit du panier
    removeFromCart: (state, action: PayloadAction<{ productId: number }>) => {
      const newState = state.filter(item => item.productId !== action.payload.productId);
      
      // Sauvegarde dans le localStorage
      try {
        localStorage.setItem("cart", JSON.stringify(newState));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Failed to save cart after removal:", errorMessage);
      }
      
      return newState;
    },
    
    // Vider completement le panier
    clearCart: () => {
      // Nettoyage du localStorage
      try {
        localStorage.removeItem("cart");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Failed to clear cart from localStorage:", errorMessage);
      }
      
      return [];
    },
    
    // Modifier la quantite d'un produit
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.find(item => item.productId === productId);
      
      if (item) {
        item.quantity = quantity;
        
        // Sauvegarde dans le localStorage
        try {
          localStorage.setItem("cart", JSON.stringify(state));
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error("Failed to save cart after quantity update:", errorMessage);
        }
      }
    },
  }
});

// Export des actions
export const { 
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} = cartSlice.actions;

// Export des selecteurs
export const selectCartItems = (state: { cart: CartItem[] }) => state.cart;

export const selectTotalQuantity = (state: { cart: CartItem[] }) =>
  state.cart.reduce((acc, item) => acc + item.quantity, 0);

export const selectTotalPrice = (state: { cart: CartItem[] }) =>
  state.cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

export const selectCartItemCount = (state: { cart: CartItem[] }) => state.cart.length;

export const selectItemQuantity = (productId: number) => 
  (state: { cart: CartItem[] }) => 
    state.cart.find(item => item.productId === productId)?.quantity || 0;

export default cartSlice.reducer;