/**
 * CART SERVICE - API GESTION PANIER
 * 
 * Service centralisé pour les opérations du panier.
 * Synchronisation avec le backend (optionnel).
 * 
 * VERSION 1.0 - PRODUCTION READY
 * 
 * Note: Le panier est principalement géré en LOCAL (Redux Persist)
 * mais ce service permet la synchronisation serveur si besoin.
 * 
 * @location src/features/cart/services/cartService.ts
 */

import apiClient from '../../../shared/api/apiClient';

import type { CartItem } from '../../../shared/types/cart';
import { getErrorMessage } from '../../../shared/types/errors.types';

// ============================================
// TYPES
// ============================================

/**
 * Requête de synchronisation du panier
 */
export interface SyncCartRequest {
  items: CartItem[];
}

/**
 * Réponse de synchronisation
 */
export interface SyncCartResponse {
  success: boolean;
  message: string;
  updatedItems?: CartItem[]; // Items mis à jour depuis le serveur
}

/**
 * Vérification de disponibilité produit
 */
export interface ProductAvailability {
  productId: number;
  available: boolean;
  currentStock: number;
  price: number;
  isActive: boolean;
}

// ============================================
// SYNCHRONISATION PANIER (Optionnel)
// ============================================

/**
 * ✅ Synchronise le panier avec le backend
 * 
 * Utilité:
 * - Vérifier que les produits sont toujours disponibles
 * - Vérifier que les prix n'ont pas changé
 * - Vérifier le stock
 * 
 * @param items - Articles du panier local
 * @returns Réponse de synchronisation
 */
export async function syncCart(items: CartItem[]): Promise<SyncCartResponse> {
  try {
    console.log('🔄 Syncing cart with backend...', items.length);

    const response = await apiClient.post<SyncCartResponse>(
      '/api/v1/cart/sync',
      { items }
    );

    console.log('✅ Cart synced:', response.data);

    return response.data;

  } catch (error: unknown) {
    console.error('❌ Error syncing cart:', getErrorMessage(error));
    
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
}

/**
 * ✅ Sauvegarde le panier sur le serveur (pour utilisateur connecté)
 * 
 * @param items - Articles du panier
 */
export async function saveCartToServer(items: CartItem[]): Promise<void> {
  try {
    console.log('💾 Saving cart to server...', items.length);

    await apiClient.post('/api/v1/cart', { items });

    console.log('✅ Cart saved to server');

  } catch (error: unknown) {
    console.error('❌ Error saving cart:', getErrorMessage(error));
    throw error;
  }
}

/**
 * ✅ Récupère le panier depuis le serveur (pour utilisateur connecté)
 * 
 * @returns Articles du panier sauvegardés
 */
export async function loadCartFromServer(): Promise<CartItem[]> {
  try {
    console.log('📦 Loading cart from server...');

    const response = await apiClient.get<{ items: CartItem[] }>('/api/v1/cart');

    console.log('✅ Cart loaded from server:', response.data.items.length);

    return response.data.items;

  } catch (error: unknown) {
    console.error('❌ Error loading cart:', getErrorMessage(error));
    return []; // Retourne un panier vide en cas d'erreur
  }
}

// ============================================
// VALIDATION PRODUITS
// ============================================

/**
 * ✅ Vérifie la disponibilité d'un produit
 * 
 * @param productId - ID du produit
 * @returns Disponibilité du produit
 */
export async function checkProductAvailability(
  productId: number
): Promise<ProductAvailability> {
  try {
    const response = await apiClient.get<ProductAvailability>(
      `/api/v1/products/${productId}/availability`
    );

    return response.data;

  } catch (error: unknown) {
    console.error(`❌ Error checking product ${productId}:`, getErrorMessage(error));
    
    // Par défaut, considérer comme indisponible
    return {
      productId,
      available: false,
      currentStock: 0,
      price: 0,
      isActive: false
    };
  }
}

/**
 * ✅ Vérifie la disponibilité de plusieurs produits
 * 
 * @param productIds - IDs des produits
 * @returns Map de disponibilités
 */
export async function checkMultipleProductsAvailability(
  productIds: number[]
): Promise<Map<number, ProductAvailability>> {
  try {
    console.log('🔍 Checking availability for products:', productIds);

    const response = await apiClient.post<ProductAvailability[]>(
      '/api/v1/products/availability/batch',
      { productIds }
    );

    // Convertir en Map pour accès rapide
    const availabilityMap = new Map<number, ProductAvailability>();
    response.data.forEach(item => {
      availabilityMap.set(item.productId, item);
    });

    console.log('✅ Availability checked for', availabilityMap.size, 'products');

    return availabilityMap;

  } catch (error: unknown) {
    console.error('❌ Error checking products:', getErrorMessage(error));
    return new Map();
  }
}

// ============================================
// VALIDATION PANIER
// ============================================

/**
 * ✅ Valide tout le panier avant checkout
 * 
 * Vérifie:
 * - Disponibilité des produits
 * - Stock suffisant
 * - Prix à jour
 * 
 * @param items - Articles du panier
 * @returns Liste des problèmes détectés
 */
export async function validateCart(items: CartItem[]): Promise<{
  isValid: boolean;
  issues: string[];
  updatedItems?: CartItem[];
}> {
  try {
    console.log('✅ Validating cart...', items.length);

    const productIds = items.map(item => item.productId);
    const availabilityMap = await checkMultipleProductsAvailability(productIds);

    const issues: string[] = [];
    const updatedItems: CartItem[] = [];

    for (const item of items) {
      const availability = availabilityMap.get(item.productId);

      if (!availability) {
        issues.push(`Produit ${item.name} introuvable`);
        continue;
      }

      // Vérifier si actif
      if (!availability.isActive) {
        issues.push(`Produit ${item.name} n'est plus disponible`);
        continue;
      }

      // Vérifier stock
      if (!availability.available || availability.currentStock < item.quantity) {
        issues.push(
          `Stock insuffisant pour ${item.name} (disponible: ${availability.currentStock})`
        );
        continue;
      }

      // Vérifier prix
      if (availability.price !== item.price) {
        issues.push(`Prix de ${item.name} a changé (${availability.price}€)`);
        updatedItems.push({
          ...item,
          price: availability.price
        });
        continue;
      }

      // Produit OK
      updatedItems.push(item);
    }

    return {
      isValid: issues.length === 0,
      issues,
      updatedItems: issues.length > 0 ? updatedItems : undefined
    };

  } catch (error: unknown) {
    console.error('❌ Error validating cart:', getErrorMessage(error));
    
    return {
      isValid: false,
      issues: ['Erreur lors de la validation du panier'],
    };
  }
}

// ============================================
// CALCUL FRAIS DE PORT (Optionnel)
// ============================================

/**
 * ✅ Calcule les frais de port
 * 
 * @param total - Total du panier
 * @param country - Pays de livraison
 * @returns Frais de port
 */
export async function calculateShipping(
  total: number,
  country: string = 'FR'
): Promise<number> {
  try {
    const response = await apiClient.post<{ shipping: number }>(
      '/api/v1/cart/shipping',
      { total, country }
    );

    return response.data.shipping;

  } catch (error: unknown) {
    console.error('❌ Error calculating shipping:', getErrorMessage(error));
    
    // Frais de port par défaut
    return total >= 50 ? 0 : 5.99;
  }
}

// ============================================
// COUPONS / CODES PROMO (Optionnel)
// ============================================

/**
 * ✅ Applique un code promo
 * 
 * @param code - Code promo
 * @param total - Total du panier
 * @returns Nouveau total après réduction
 */
export async function applyCoupon(
  code: string,
  total: number
): Promise<{
  success: boolean;
  newTotal: number;
  discount: number;
  message: string;
}> {
  try {
    console.log('🎟️ Applying coupon:', code);

    const response = await apiClient.post<{
      success: boolean;
      newTotal: number;
      discount: number;
      message: string;
    }>('/api/v1/cart/coupon', { code, total });

    console.log('✅ Coupon applied:', response.data);

    return response.data;

  } catch (error: unknown) {
    console.error('❌ Error applying coupon:', getErrorMessage(error));
    
    return {
      success: false,
      newTotal: total,
      discount: 0,
      message: getErrorMessage(error)
    };
  }
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

const cartService = {
  // Synchronisation
  syncCart,
  saveCartToServer,
  loadCartFromServer,
  
  // Validation
  checkProductAvailability,
  checkMultipleProductsAvailability,
  validateCart,
  
  // Calculs
  calculateShipping,
  applyCoupon
};

export default cartService;

/**
 * ✅ EXEMPLES D'UTILISATION:
 * 
 * // Valider le panier avant checkout
 * const validation = await validateCart(cartItems);
 * if (!validation.isValid) {
 *   console.error('Issues:', validation.issues);
 * }
 * 
 * // Synchroniser avec le backend
 * await syncCart(cartItems);
 * 
 * // Vérifier disponibilité
 * const availability = await checkProductAvailability(productId);
 * if (!availability.available) {
 *   console.log('Produit indisponible');
 * }
 * 
 * // Calculer frais de port
 * const shipping = await calculateShipping(total, 'FR');
 * 
 * // Appliquer code promo
 * const result = await applyCoupon('PROMO10', total);
 * if (result.success) {
 *   console.log(`Réduction: ${result.discount}€`);
 * }
 * 
 * NOTES:
 * - Ce service est OPTIONNEL
 * - Le panier fonctionne déjà avec Redux Persist
 * - Utilisez ces fonctions pour:
 *   * Synchronisation serveur
 *   * Validation avant checkout
 *   * Calculs côté serveur
 *   * Codes promo
 */