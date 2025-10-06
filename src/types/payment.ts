// Types pour le paiement et le panier
export interface ElementErrors {
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
  name?: string;
  imageUrl?: string;
}

export interface CartContextType {
  cart: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export interface PaymentIntentResponse {
  clientSecret: string;
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

// Types pour les commandes
export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderRequest {
  totalPrice: number;
  paymentId: string;
  paymentStatus: string;
  items: OrderItem[];
}

