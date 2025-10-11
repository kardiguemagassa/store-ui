import type { PaymentIntent, Stripe, StripeElements } from "@stripe/stripe-js";
import type { User } from "./auth";
import type { CartItem, ElementErrors } from "./payment";
import type { ActionDataErrors } from "./errors";


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
  validationErrors?: ActionDataErrors;
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
  validationErrors?: ActionDataErrors;
}