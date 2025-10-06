import type { PaymentIntent, Stripe, StripeElements } from "@stripe/stripe-js";
import type { User } from "./auth";
import type { CartItem, ElementErrors } from "./payment";

// Paramètres pour les actions de checkout
export interface ProcessPaymentParams {
  stripe: Stripe | null;
  elements: StripeElements | null; 
  user: User | null;
  cart: CartItem[];
  totalPrice: number;
  elementErrors: ElementErrors;
}

export interface ProcessPaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export interface CreateOrderParams {
  totalPrice: number;
  paymentIntent: PaymentIntent;
  cart: CartItem[];
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;
}