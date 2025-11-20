import { CardNumberElement } from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import apiClient from '../../../shared/api/apiClient';
import { handleApiError, logger } from '../../../shared/types/errors.types';
import { userToBillingDetails } from "../../../shared/utils/stripeHelpers";
import type { Address, User } from "../../auth/types/auth.types";
import type { 
  CartItem, 
  CreateOrderResult, 
  OrderRequest, 
  PaymentIntentResponse, 
  ProcessPaymentParams, 
  ProcessPaymentResult 
} from "../../payment/types/payment.pytes"; 


// API CALLS - PAYMENT INTENT
export async function createPaymentIntent(amountInCents: number, currency: string = 'eur'): Promise<PaymentIntentResponse> {
  try {
    logger.debug("Création du payment intent", "paymentService", { amountInCents, currency });

    const response = await apiClient.post<PaymentIntentResponse>(
      '/payment/create-payment-intent',
      {
        amount: amountInCents,
        currency: currency.toLowerCase()
      }
    );

    logger.debug("Payment intent créé avec succès", "paymentService", { 
      paymentIntentId: response.data.paymentIntentId,
      amount: amountInCents
    });
    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur lors de la création du payment intent", "paymentService", error, { amountInCents, currency });
    throw error;
  }
}

export async function confirmPayment(paymentIntentId: string): Promise<void> {
  try {
    await apiClient.post(`/payment/${paymentIntentId}/confirm`);
    logger.debug("Paiement confirmé sur le serveur", "paymentService", { paymentIntentId });
  } catch (error: unknown) {
    logger.error("Erreur lors de la confirmation du paiement", "paymentService", error, { paymentIntentId });
    throw error;
  }
}

export async function cancelPayment(paymentIntentId: string): Promise<void> {
  try {
    await apiClient.post(`/payment/${paymentIntentId}/cancel`);
    logger.debug("Paiement annulé", "paymentService", { paymentIntentId });
  } catch (error: unknown) {
    logger.error("Erreur lors de l'annulation du paiement", "paymentService", error, { paymentIntentId });
    throw error;
  }
}

export async function processPayment({ 
  stripe, 
  elements, 
  user, 
  cart, 
  totalPrice 
}: ProcessPaymentParams): Promise<ProcessPaymentResult> {
  
  if (!stripe || !elements) {
    logger.warn("Stripe non chargé", "paymentService");
    return { success: false, error: "Stripe n'est pas encore chargé." };
  }

  if (!user) {
    logger.warn("Utilisateur manquant", "paymentService");
    return { success: false, error: "Informations utilisateur manquantes." };
  }

  if (!user.address) {
    logger.warn("Adresse manquante", "paymentService", { userId: user.id });
    return { 
      success: false, 
      error: "Adresse de livraison requise. Veuillez compléter votre profil." 
    };
  }

  // Vérification détaillée du panier
  logger.debug("Vérification du panier", "paymentService", {
    cartLength: cart?.length,
    cartItems: cart,
    totalPrice
  });

  if (!cart || cart.length === 0) {
    logger.warn("Panier vide détecté", "paymentService", {
      cartIsArray: Array.isArray(cart),
      cartType: typeof cart,
      cartValue: cart
    });
    return { success: false, error: "Le panier est vide." };
  }

  try {
    // RÉER PAYMENT INTENT
    const amountInCents = Math.round(totalPrice * 100);
    
    logger.info("Création du payment intent", "paymentService", {
      amountInCents,
      totalPriceEuros: totalPrice,
      currency: 'eur',
      cartItemsCount: cart.length,
      cartItems: cart.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    });

    const paymentIntentResponse = await createPaymentIntent(amountInCents, 'eur');
    const { clientSecret } = paymentIntentResponse;

    if (!clientSecret) {
      logger.error("Clé secrète manquante", "paymentService", null, { paymentIntentResponse });
      return { success: false, error: "Clé secrète manquante du serveur." };
    }

    // RÉCUPÉRER ÉLÉMENT CARTE
    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      logger.error("Élément carte bancaire introuvable", "paymentService");
      return { success: false, error: "Élément carte bancaire introuvable." };
    }

    // PRÉPARER BILLING DETAILS
    const userWithAddress = user as User & { address: Address };
    const billingDetails = userToBillingDetails(userWithAddress);

    logger.debug("Détails de facturation préparés", "paymentService", {
      hasBillingDetails: !!billingDetails,
      clientSecretLength: clientSecret?.length
    });

    // CONFIRMER PAIEMENT STRIPE
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

    // GÉRER RÉSULTAT
    if (error) {
      logger.error("Erreur de paiement Stripe", "paymentService", error, {
        errorType: error.type,
        errorCode: error.code,
        cartItemsCount: cart.length
      });
      return { 
        success: false, 
        error: error.message || "Échec du paiement. Veuillez réessayer." 
      };
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      logger.info("Paiement réussi", "paymentService", {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        cartItemsCount: cart.length
      });
      return { success: true, paymentIntent };
    }

    logger.warn("Paiement non abouti", "paymentService", { 
      paymentIntentStatus: paymentIntent?.status,
      cartItemsCount: cart.length
    });
    return { success: false, error: "Le paiement n'a pas abouti." };

  } catch (error: unknown) {
    logger.error("Erreur lors du traitement du paiement", "paymentService", error, {
      cartItemsCount: cart.length,
      totalPrice,
      cartItems: cart
    });
    
    const errorInfo = handleApiError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
    };
  }
}

// CRÉATION COMMANDE
export async function createOrder(
  totalPrice: number, 
  paymentIntent: PaymentIntent, 
  cart: CartItem[]
): Promise<CreateOrderResult> {
  try {
    logger.info("Création de commande", "paymentService", {
      totalPrice,
      paymentIntentId: paymentIntent.id,
      itemsCount: cart.length,
      paymentStatus: paymentIntent.status
    });

    const orderData: OrderRequest = {
      totalPrice: totalPrice,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      items: cart.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const response = await apiClient.post<{ orderId: number }>("/orders", orderData);
    
    logger.info("Commande créée avec succès", "paymentService", {
      orderId: response.data.orderId,
      paymentIntentId: paymentIntent.id
    });
    
    return { 
      success: true, 
      orderId: response.data.orderId 
    };

  } catch (error: unknown) {
    logger.error("Erreur lors de la création de commande", "paymentService", error, {
      totalPrice,
      paymentIntentId: paymentIntent.id,
      itemsCount: cart.length
    });
    
    const errorInfo = handleApiError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
    };
  }
}

// EXPORT PAR DÉFAUT
const paymentService = {
  createPaymentIntent,
  confirmPayment,
  cancelPayment,
  processPayment,
  createOrder
};

export default paymentService;