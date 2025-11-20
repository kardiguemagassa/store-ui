import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../../../shared/types/cart";
import type { Product } from "../../products/types/product.types";

/**
 * CART SLICE - VERSION 4.0 REDUX PERSIST COMPATIBLE
 * 
 * IMPORTANT: Ne PAS utiliser localStorage directement !
 * Redux Persist gère automatiquement la persistence.
 * 
 * Structure cohérente:
 * - state.cart = { items: [], totalQuantity: number, totalPrice: number }
 * - Compatible avec Redux Persist
 * - Persistence automatique via store.ts
 * 
 * @version 4.0 (Redux Persist Compatible - No Manual localStorage)
 */

// ============================================
// TYPES
// ============================================

export interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

// ============================================
// INITIAL STATE
// ============================================

/**
 * ✅ State initial simple (SANS localStorage)
 * Redux Persist restaurera automatiquement les données
 */
const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculer les totaux du panier
 */
const calculateTotals = (items: CartItem[]): Pick<CartState, 'totalQuantity' | 'totalPrice'> => {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  
  return { totalQuantity, totalPrice };
};

// ============================================
// SLICE
// ============================================

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * ✅ Ajouter un produit au panier
     */
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.productId === product.productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ 
          ...product, 
          quantity 
        });
      }
      
      // ✅ Recalculer les totaux
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      
      // ✅ Redux Persist sauvegarde automatiquement (pas besoin de localStorage.setItem)
    },
    
    /**
     * ✅ Retirer un produit du panier
     */
    removeFromCart: (state, action: PayloadAction<{ productId: number }>) => {
      state.items = state.items.filter(item => item.productId !== action.payload.productId);
      
      // ✅ Recalculer les totaux
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
      
      // ✅ Redux Persist sauvegarde automatiquement
    },
    
    /**
     * ✅ Vider complètement le panier
     */
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      
      // ✅ Redux Persist efface automatiquement
    },
    
    /**
     * ✅ Modifier la quantité d'un produit
     */
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        item.quantity = quantity;
        
        // ✅ Recalculer les totaux
        const totals = calculateTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalPrice = totals.totalPrice;
        
        // ✅ Redux Persist sauvegarde automatiquement
      }
    },
  }
});

// ============================================
// EXPORTS
// ============================================

/**
 * ✅ Export des actions
 */
export const { 
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} = cartSlice.actions;

/**
 * ✅ Export des selecteurs
 */
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectTotalQuantity = (state: { cart: CartState }) => state.cart.totalQuantity;

export const selectTotalPrice = (state: { cart: CartState }) => state.cart.totalPrice;

export const selectCartItemCount = (state: { cart: CartState }) => state.cart.items.length;

export const selectItemQuantity = (productId: number) => 
  (state: { cart: CartState }) => 
    state.cart.items.find(item => item.productId === productId)?.quantity || 0;

/**
 * ✅ Export du reducer
 */
export default cartSlice.reducer;

/**
 * ✅ NOTES IMPORTANTES:
 * 
 * PERSISTENCE AUTOMATIQUE:
 * - Redux Persist (configuré dans store.ts) sauvegarde TOUT le cart
 * - Pas besoin de localStorage.setItem() manuel
 * - Pas besoin de localStorage.getItem() dans initialState
 * - Persistence transparente et automatique
 * 
 * STRUCTURE STATE:
 * state.cart = {
 *   items: CartItem[],        // Produits dans le panier
 *   totalQuantity: number,     // Quantité totale
 *   totalPrice: number         // Prix total
 * }
 * 
 * UTILISATION DANS LES COMPOSANTS:
 * const items = useAppSelector(selectCartItems);
 * const totalQuantity = useAppSelector(selectTotalQuantity);
 * const totalPrice = useAppSelector(selectTotalPrice);
 * 
 * OU DIRECTEMENT:
 * const totalQuantity = useAppSelector(state => state.cart.totalQuantity);
 * 
 * FLOW AVEC REDUX PERSIST:
 * 
 * 1. ACTION (addToCart, removeFromCart, etc.)
 *    → Redux met à jour state.cart
 * 
 * 2. REDUX PERSIST (automatique)
 *    → Détecte le changement
 *    → Sauvegarde dans localStorage['persist:root']
 * 
 * 3. REFRESH PAGE
 *    → PersistGate restaure depuis localStorage
 *    → state.cart retrouve ses valeurs
 *    → Badge panier conservé ✅
 * 
 * AVANTAGES:
 * - Plus de code localStorage manuel
 * - Persistence centralisée dans store.ts
 * - Pas de risque de désynchronisation
 * - Plus simple et plus propre
 * - Compatible TypeScript strict
 */