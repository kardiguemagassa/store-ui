import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage, logger } from '../../../shared/types/errors.types';
import type { CartItem } from '../../payment/types/payment.pytes';


export interface SyncCartRequest {
  items: CartItem[];
}

// Réponse de synchronisation
export interface SyncCartResponse {
  success: boolean;
  message: string;
  updatedItems?: CartItem[]; 
}

// Vérification de disponibilité produit
export interface ProductAvailability {
  productId: number;
  available: boolean;
  currentStock: number;
  price: number;
  isActive: boolean;
}

// Synchronise le panier avec le backend
export async function syncCart(items: CartItem[]): Promise<SyncCartResponse> {
  try {
    logger.info('Synchronisation du panier avec le backend', 'syncCart', {
      itemsCount: items.length
    });

    const response = await apiClient.post<SyncCartResponse>('/api/v1/cart/sync',{ items });

    logger.info('Panier synchronisé avec succès', 'syncCart', {
      success: response.data.success,
      updatedItemsCount: response.data.updatedItems?.length || 0
    });

    return response.data;

  } catch (error: unknown) {
    logger.error('Erreur lors de la synchronisation du panier', 'syncCart', error);
    
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
}

// Sauvegarde le panier sur le serveur (pour utilisateur connecté)
export async function saveCartToServer(items: CartItem[]): Promise<void> {
  try {
    logger.info('Sauvegarde du panier sur le serveur', 'saveCartToServer', {
      itemsCount: items.length
    });

    await apiClient.post('/api/v1/cart', { items });

    logger.info('Panier sauvegardé sur le serveur avec succès', 'saveCartToServer');

  } catch (error: unknown) {
    logger.error('Erreur lors de la sauvegarde du panier', 'saveCartToServer', error);
    throw error;
  }
}

// Récupère le panier depuis le serveur (pour utilisateur connecté)
export async function loadCartFromServer(): Promise<CartItem[]> {
  try {
    logger.info('Chargement du panier depuis le serveur', 'loadCartFromServer');

    const response = await apiClient.get<{ items: CartItem[] }>('/api/v1/cart');

    logger.info('Panier chargé depuis le serveur avec succès', 'loadCartFromServer', {
      itemsCount: response.data.items.length
    });

    return response.data.items;

  } catch (error: unknown) {
    logger.error('Erreur lors du chargement du panier', 'loadCartFromServer', error);
    return []; // Retourne un panier vide en cas d'erreur
  }
}

// Vérifie la disponibilité d'un produit
export async function checkProductAvailability(
  productId: number
): Promise<ProductAvailability> {
  try {
    const response = await apiClient.get<ProductAvailability>(`/api/v1/products/${productId}/availability`);

    return response.data;

  } catch (error: unknown) {
    logger.error(`Erreur lors de la vérification du produit ${productId}`, 'checkProductAvailability', error);
    
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

// Vérifie la disponibilité de plusieurs produits
export async function checkMultipleProductsAvailability(
  productIds: number[]
): Promise<Map<number, ProductAvailability>> {
  try {
    logger.info('Vérification de la disponibilité des produits', 'checkMultipleProductsAvailability', {
      productIdsCount: productIds.length
    });

    const response = await apiClient.post<ProductAvailability[]>('/api/v1/products/availability/batch',{ productIds });

    // Convertir en Map pour accès rapide
    const availabilityMap = new Map<number, ProductAvailability>();
    response.data.forEach(item => {
      availabilityMap.set(item.productId, item);
    });

    logger.info('Disponibilité des produits vérifiée avec succès', 'checkMultipleProductsAvailability', {
      productsChecked: availabilityMap.size
    });

    return availabilityMap;

  } catch (error: unknown) {
    logger.error('Erreur lors de la vérification des produits', 'checkMultipleProductsAvailability', error);
    return new Map();
  }
}

// Valide tout le panier avant checkout
export async function validateCart(items: CartItem[]): Promise<{
  isValid: boolean;
  issues: string[];
  updatedItems?: CartItem[];
}> {
  try {
    logger.info('Validation du panier', 'validateCart', {itemsCount: items.length});

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

    const validationResult = {
      isValid: issues.length === 0,
      issues,
      updatedItems: issues.length > 0 ? updatedItems : undefined
    };

    logger.info('Validation du panier terminée', 'validateCart', {
      isValid: validationResult.isValid,
      issuesCount: validationResult.issues.length,
      updatedItemsCount: validationResult.updatedItems?.length || 0
    });

    return validationResult;

  } catch (error: unknown) {
    logger.error('Erreur lors de la validation du panier', 'validateCart', error);
    
    return {
      isValid: false,
      issues: ['Erreur lors de la validation du panier'],
    };
  }
}


/**
 * Calcule les frais de port
 * 
 * @param total - Total du panier
 * @param country - Pays de livraison
 * @returns Frais de port
 */
export async function calculateShipping(total: number,country: string = 'FR'): Promise<number> {
  try {
    const response = await apiClient.post<{ shipping: number }>('/api/v1/cart/shipping',{ total, country });

    return response.data.shipping;

  } catch (error: unknown) {
    logger.error('Erreur lors du calcul des frais de port', 'calculateShipping', error);
    
    // Frais de port par défaut
    return total >= 50 ? 0 : 5.99;
  }
}

/**
 * Applique un code promo
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
    logger.info('Application du code promo', 'applyCoupon', { code });

    const response = await apiClient.post<{
      success: boolean;
      newTotal: number;
      discount: number;
      message: string;
    }>('/api/v1/cart/coupon', { code, total });

    logger.info('Code promo appliqué avec succès', 'applyCoupon', {
      success: response.data.success,
      discount: response.data.discount,
      newTotal: response.data.newTotal
    });

    return response.data;

  } catch (error: unknown) {
    logger.error('Erreur lors de l\'application du code promo', 'applyCoupon', error);
    
    return {
      success: false,
      newTotal: total,
      discount: 0,
      message: getErrorMessage(error)
    };
  }
}

// EXPORT PAR DÉFAUT
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