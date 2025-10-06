import apiClient from "../api/apiClient";
import { CardNumberElement } from "@stripe/react-stripe-js";
import { userToBillingDetails } from "../utils/stripeHelpers";
import { handleError } from "../types/errors";
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
    return { success: false, error: "Stripe.js is not loaded yet." };
  }

  if (!user) {
    return { success: false, error: "User information is missing." };
  }

  if (cart.length === 0) {
    return { success: false, error: "Cart is empty." };
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
      return { success: false, error: "No client secret received from server." };
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      return { success: false, error: "Card number element not found." };
    }

    // SIMPLE ET PROPRE
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
        error: error.message || "Payment failed. Please try again." 
      };
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      return { success: true, paymentIntent };
    }

    return { success: false, error: "Payment was not successful." };
  } catch (error: unknown) {
    console.error("Error processing payment:", error);
    const errorMessage = handleError(error);
    return { 
      success: false, 
      error: `Payment processing failed: ${errorMessage}`
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
    console.error("Failed to create order:", error);
    const errorMessage = handleError(error);
    return { 
      success: false, 
      error: `Order creation failed: ${errorMessage}`
    };
  }
}