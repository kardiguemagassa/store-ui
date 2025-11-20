/**
 * TYPES PAYMENT - VERSION FINALE
 * Types pour le système de paiement Stripe
 * 
 * ⚠️ NE PAS dupliquer OrderRequest ici - utiliser celui de orders.types.ts
 * 
 * @location src/features/payment/types/payment.types.ts
 */

import type { Stripe, StripeElements, PaymentIntent } from "@stripe/stripe-js";
import type { CartItem } from "../../../shared/types/cart";
import type { User } from "../../auth/types/auth.types";

// ✅ IMPORT des types de commandes (ne pas les redéfinir !)
import type { OrderRequest, CreateOrderResult, OrderValidationError } from "../../orders/types/orders.types";

// Ré-export pour faciliter l'import dans d'autres fichiers
export type { OrderRequest, CreateOrderResult, OrderValidationError };

// ============================================
// TYPES STRIPE ELEMENTS
// ============================================

export interface ElementErrors {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface StripeElementChangeEvent {
  error?: {
    message: string;
  };
  empty?: boolean;
  complete?: boolean;
  value?: {
    postalCode?: string;
  };
}

// ============================================
// TYPES PAYMENT INTENT
// ============================================

export interface PaymentIntentRequest {
  amount: number;      // Montant en centimes (ex: 2999 = 29,99€)
  currency: string;    // Code devise (ex: "eur")
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
}

// ============================================
// TYPES PROCESS PAYMENT
// ============================================

/**
 * Paramètres pour processPayment
 */
export interface ProcessPaymentParams {
  stripe: Stripe;
  elements: StripeElements;
  user: User;
  cart: CartItem[];
  totalPrice: number;
}

/**
 * Résultat de processPayment
 */
export interface ProcessPaymentResult {
  success: boolean;
  error?: string;
  validationErrors?: Record<string, string>;
  paymentIntent?: PaymentIntent;
}

// ============================================
// TYPES CART CONTEXT (si nécessaire)
// ============================================

export interface CartContextType {
  cart: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

/**
 * ✅ RÈGLES D'IMPORT:
 * 
 * Pour utiliser OrderRequest dans un composant de paiement :
 * 
 * import type { OrderRequest } from "../../orders/types/orders.types";
 * // OU
 * import type { OrderRequest } from "../types/payment.types"; // Ré-exporté
 * 
 * ❌ NE PAS redéfinir OrderRequest dans ce fichier !
 */