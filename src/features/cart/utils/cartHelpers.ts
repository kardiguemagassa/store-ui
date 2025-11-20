/**
 * CART HELPERS - VERSION CORRIGÉE
 * 
 * Utilitaires pour la gestion du panier.
 * Validation, calculs et formatage.
 * 
 * VERSION 2.0 - FIXED CURRENCY
 * 
 * @location src/features/cart/utils/cartHelpers.ts
 */

import type { User } from '../../auth/types/auth.types';
import type { CartItem } from '../../../shared/types/cart';

// ============================================
// VALIDATION ADRESSE
// ============================================

export function isAddressComplete(user: User | null): boolean {
  if (!user || !user.address) return false;

  const { street, city, state, postalCode, country } = user.address;

  return Boolean(
    street && 
    city && 
    state && 
    postalCode && 
    country
  );
}

export function isAddressIncomplete(user: User | null): boolean {
  return !isAddressComplete(user);
}

export function getMissingAddressFields(user: User | null): string[] {
  if (!user || !user.address) {
    return ['street', 'city', 'state', 'postalCode', 'country'];
  }

  const missing: string[] = [];
  const { street, city, state, postalCode, country } = user.address;

  if (!street) missing.push('street');
  if (!city) missing.push('city');
  if (!state) missing.push('state');
  if (!postalCode) missing.push('postalCode');
  if (!country) missing.push('country');

  return missing;
}

// ============================================
// CALCULS PANIER
// ============================================

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

export function calculateTotalQuantity(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

export function calculateUniqueItems(items: CartItem[]): number {
  return items.length;
}

// ============================================
// FORMATAGE
// ============================================

/**
 * ✅ Formate un prix en devise (CORRIGÉ)
 * 
 * @param price - Prix à formater
 * @param currency - Devise (défaut: EUR)
 * @returns Prix formaté
 */
export function formatPrice(
  price: number, 
  currency: string = 'EUR' // ✅ CORRECTION: EUR au lieu de USD
): string {
  if (isNaN(price) || price == null) return '0,00 €';

  // ✅ CORRECTION: Utiliser 'fr-FR' avec EUR
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency // ✅ EUR = "29,99 €"
  }).format(price);
}

/**
 * ✅ Formate un prix simple (sans symbole monétaire)
 */
export function formatPriceSimple(price: number): string {
  if (isNaN(price) || price == null) return '0,00';
  return price.toFixed(2).replace('.', ','); // ✅ Format français
}

// ============================================
// VALIDATION PANIER
// ============================================

export function isCartEmpty(items: CartItem[]): boolean {
  return items.length === 0;
}

export function isInCart(items: CartItem[], productId: number): boolean {
  return items.some(item => item.productId === productId);
}

export function getCartItem(
  items: CartItem[], 
  productId: number
): CartItem | undefined {
  return items.find(item => item.productId === productId);
}

// ============================================
// VALIDATION QUANTITÉ
// ============================================

export function validateQuantity(quantity: number, max: number = 99): number {
  if (isNaN(quantity) || quantity < 1) return 1;
  if (quantity > max) return max;
  return Math.floor(quantity);
}

export function isQuantityValid(quantity: number, stock?: number): boolean {
  if (isNaN(quantity) || quantity < 1) return false;
  if (stock !== undefined && quantity > stock) return false;
  return true;
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

const cartHelpers = {
  isAddressComplete,
  isAddressIncomplete,
  getMissingAddressFields,
  calculateTotal,
  calculateTotalQuantity,
  calculateUniqueItems,
  formatPrice,
  formatPriceSimple,
  isCartEmpty,
  isInCart,
  getCartItem,
  validateQuantity,
  isQuantityValid
};

export default cartHelpers;

/**
 * ✅ CHANGEMENTS v2.0:
 * 
 * 1. Devise par défaut: EUR au lieu de USD ✅
 * 2. Locale: fr-FR pour format français ✅
 * 3. Format: "29,99 €" au lieu de "$29.99" ✅
 * 4. formatPriceSimple avec virgule ✅
 * 
 * EXEMPLES:
 * 
 * formatPrice(29.99) → "29,99 €"
 * formatPrice(100) → "100,00 €"
 * formatPriceSimple(29.99) → "29,99"
 */