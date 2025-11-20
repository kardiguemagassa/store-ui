import { CardNumberElement } from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage, handleApiError } from '../../../shared/types/errors.types';
import { userToBillingDetails } from "../../../shared/utils/stripeHelpers";
import type { CartItem } from "../../../shared/types/cart";
import type { Address, User } from "../../auth/types/auth.types";
import type { 
  CreateOrderResult, 
  OrderRequest, 
  PaymentIntentResponse, 
  ProcessPaymentParams, 
  ProcessPaymentResult 
} from "../types/payment.pytes";


// API CALLS - PAYMENT INTENT
//Créer un Payment Intent Stripe
export async function createPaymentIntent(amountInCents: number, currency: string = 'eur'): Promise<PaymentIntentResponse> {
  try {
    console.log('💳 Creating payment intent:', { amountInCents, currency });

    const response = await apiClient.post<PaymentIntentResponse>(
      '/payment/create-payment-intent',
      {
        amount: amountInCents, // ✅ Déjà en centimes
        currency: currency.toLowerCase()
      }
    );

    console.log('✅ Payment intent created:', response.data.paymentIntentId);
    return response.data;

  } catch (error: unknown) {
    console.error('❌ Error creating payment intent:', getErrorMessage(error));
    throw error;
  }
}

// Confirmer un paiement (optionnel)
export async function confirmPayment(paymentIntentId: string): Promise<void> {
  try {
    await apiClient.post(`/payment/${paymentIntentId}/confirm`);
    console.log('✅ Payment confirmed on server');
  } catch (error: unknown) {
    console.error('❌ Error confirming payment:', getErrorMessage(error));
    throw error;
  }
}

//Annuler un paiement
export async function cancelPayment(paymentIntentId: string): Promise<void> {
  try {
    await apiClient.post(`/payment/${paymentIntentId}/cancel`);
    console.log('Payment cancelled');
  } catch (error: unknown) {
    console.error('Error cancelling payment:', getErrorMessage(error));
    throw error;
  }
}

// ============================================
// ORCHESTRATION PAIEMENT
// ============================================

/**
 * Traiter le paiement complet
 */
export async function processPayment({ 
  stripe, 
  elements, 
  user, 
  cart, 
  totalPrice 
}: ProcessPaymentParams): Promise<ProcessPaymentResult> {
  
  // 1️⃣ VALIDATIONS
  if (!stripe || !elements) {
    return { success: false, error: "Stripe n'est pas encore chargé." };
  }

  if (!user) {
    return { success: false, error: "Informations utilisateur manquantes." };
  }

  if (!user.address) {
    return { 
      success: false, 
      error: "Adresse de livraison requise. Veuillez compléter votre profil." 
    };
  }

  if (cart.length === 0) {
    return { success: false, error: "Le panier est vide." };
  }

  try {
    // 2️⃣ CRÉER PAYMENT INTENT
    const amountInCents = Math.round(totalPrice * 100);
    
    const paymentIntentResponse = await createPaymentIntent(
      amountInCents,
      'eur'
    );

    const { clientSecret } = paymentIntentResponse;

    if (!clientSecret) {
      return { success: false, error: "Clé secrète manquante du serveur." };
    }

    // 3️⃣ RÉCUPÉRER ÉLÉMENT CARTE
    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      return { success: false, error: "Élément carte bancaire introuvable." };
    }

    // 4️⃣ PRÉPARER BILLING DETAILS
    const userWithAddress = user as User & { address: Address };
    const billingDetails = userToBillingDetails(userWithAddress);

    // 5️⃣ CONFIRMER PAIEMENT STRIPE
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardNumberElement,
          billing_details: billingDetails,
        },
        return_url: `${window.location.origin}/order-success`,
      }
    );

    // 6️⃣ GÉRER RÉSULTAT
    if (error) {
      console.error('❌ Stripe payment error:', error);
      return { 
        success: false, 
        error: error.message || "Échec du paiement. Veuillez réessayer." 
      };
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      console.log('✅ Payment succeeded:', paymentIntent.id);
      return { success: true, paymentIntent };
    }

    return { success: false, error: "Le paiement n'a pas abouti." };

  } catch (error: unknown) {
    console.error("❌ Error processing payment:", error);
    
    const errorInfo = handleApiError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
      
    };
  }
}

// ============================================
// CRÉATION COMMANDE
// ============================================

/**
 * Créer une commande après paiement réussi
 */
export async function createOrder(
  totalPrice: number, 
  paymentIntent: PaymentIntent, 
  cart: CartItem[]
): Promise<CreateOrderResult> {
  try {
    console.log('📦 Creating order:', {
      totalPrice,
      paymentIntentId: paymentIntent.id,
      itemsCount: cart.length
    });

    // ✅ CORRECTION: Utiliser paymentIntentId (cohérent avec OrderRequest)
    const orderData: OrderRequest = {
      totalPrice: totalPrice,
      paymentIntentId: paymentIntent.id,    // ✅ Correct
      paymentStatus: paymentIntent.status,
      items: cart.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const response = await apiClient.post<{ orderId: number }>("/orders", orderData);
    
    console.log('✅ Order created:', response.data.orderId);
    
    return { 
      success: true, 
      orderId: response.data.orderId 
    };

  } catch (error: unknown) {
    console.error("❌ Error creating order:", error);
    
    const errorInfo = handleApiError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
     
    };
  }
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

const paymentService = {
  // API
  createPaymentIntent,
  confirmPayment,
  cancelPayment,
  
  // Orchestration
  processPayment,
  createOrder
};

export default paymentService;

/**
 * ✅ COHÉRENCE FRONTEND ↔ BACKEND:
 * 
 * Frontend envoie:
 * {
 *   totalPrice: 99.99,
 *   paymentIntentId: "pi_3ABC...",  ← Correct !
 *   paymentStatus: "succeeded",
 *   items: [...]
 * }
 * 
 * Backend attend (OrderRequestDto):
 * {
 *   totalPrice: BigDecimal,
 *   paymentIntentId: String,  ← Correspond !
 *   paymentStatus: String,
 *   items: List<OrderItemDto>
 * }
 */