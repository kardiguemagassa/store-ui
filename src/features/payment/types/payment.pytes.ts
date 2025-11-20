import type { Stripe, StripeElements, PaymentIntent } from "@stripe/stripe-js";
import type { User } from "../../auth/types/auth.types";
import type { OrderRequest, CreateOrderResult, OrderValidationError } from "../../orders/types/orders.types";
export type { OrderRequest, CreateOrderResult, OrderValidationError };


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

// TYPES PROCESS PAYMENT

// ype pour les éléments du panier
export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
  name?: string;
  imageUrl?: string;
}

// Paramètres pour processPayment
export interface ProcessPaymentParams {
  stripe: Stripe;
  elements: StripeElements;
  user: User;
  cart: CartItem[]; 
  totalPrice: number;
}

// Résultat de processPayment
export interface ProcessPaymentResult {
  success: boolean;
  error?: string;
  validationErrors?: Record<string, string>;
  paymentIntent?: PaymentIntent;
}

// TYPES CART CONTEXT (si nécessaire)
export interface CartContextType {
  cart: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}