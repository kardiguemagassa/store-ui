import apiClient from "../api/apiClient";
import { CardNumberElement } from "@stripe/react-stripe-js";
import { userToBillingDetails } from "../utils/stripeHelpers";
import { handleApiError } from "../types/errors";
import type { 
  ProcessPaymentParams, 
  ProcessPaymentResult,
  CreateOrderResult 
} from "../types/actions";
import type { CartItem } from "../types/cart";
import type { PaymentIntentResponse } from "../types/payment";
import type { OrderRequest } from "../types/orders";
import type { PaymentIntent } from "@stripe/stripe-js";

export async function processPayment({ 
  stripe, 
  elements, 
  user, 
  cart, 
  totalPrice 
}: ProcessPaymentParams): Promise<ProcessPaymentResult> {
  if (!stripe || !elements) {
    return { success: false, error: "Stripe n'est pas encore chargé." };
  }

  if (!user) {
    return { success: false, error: "Informations utilisateur manquantes." };
  }

  if (cart.length === 0) {
    return { success: false, error: "Le panier est vide." };
  }

  try {
    const response = await apiClient.post<PaymentIntentResponse>(
      "/payment/create-payment-intent", 
      {
        amount: Math.round(totalPrice * 100),
        currency: "usd",
      }
    );

    const { clientSecret } = response.data;

    if (!clientSecret) {
      return { success: false, error: "Clé secrète manquante du serveur." };
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      return { success: false, error: "Élément carte bancaire introuvable." };
    }

    const billingDetails = userToBillingDetails(user);

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

    if (error) {
      return { 
        success: false, 
        error: error.message || "Échec du paiement. Veuillez réessayer." 
      };
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      return { success: true, paymentIntent };
    }

    return { success: false, error: "Le paiement n'a pas abouti." };
  } catch (error: unknown) {
    console.error("Erreur lors du traitement du paiement:", error);
    
    //SYSTÈME D'ERREURS CENTRALISÉ
    const errorInfo = handleApiError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
      validationErrors: errorInfo.errors
    };
  }
}

export async function createOrder(
  totalPrice: number, 
  paymentIntent: PaymentIntent, 
  cart: CartItem[]
): Promise<CreateOrderResult> {
  try {
    const orderData: OrderRequest = {
      totalPrice: totalPrice,
      paymentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      items: cart.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const response = await apiClient.post<{ orderId: number }>("/orders", orderData);
    return { success: true, orderId: response.data.orderId };
  } catch (error: unknown) {
    console.error("Échec de la création de commande:", error);
    
    // SYSTÈME D'ERREURS CENTRALISÉ
    const errorInfo = handleApiError(error);
    
    return { 
      success: false, 
      error: errorInfo.message,
      validationErrors: errorInfo.errors
    };
  }
}