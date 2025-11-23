import { loadStripe } from "@stripe/stripe-js";
import { logger } from "../shared/types/errors.types";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  logger.error("Stripe public key is missing", "stripeConfig");
  throw new Error("Stripe public key is missing in environment variables");
}

// Validation de la clé
if (!stripePublicKey.startsWith('pk_')) {
  logger.error("Invalid Stripe public key format", "stripeConfig", null, {
    keyPrefix: stripePublicKey.substring(0, 10) + '...'
  });
  throw new Error("Invalid Stripe public key format");
}

logger.info("Initializing Stripe", "stripeConfig", {
  keyAvailable: true,
  environment: import.meta.env.MODE
});

// Configuration Stripe avec gestion d'erreurs
export const stripePromise = loadStripe(stripePublicKey, {
  // Options optionnelles pour améliorer la stabilité
  locale: 'fr' // Français
});

// Surveillance du chargement (optionnel)
stripePromise.then((stripe) => {
  if (stripe) {
    logger.info("Stripe loaded successfully", "stripeConfig");
  } else {
    logger.warn("Stripe loaded but returned null", "stripeConfig");
  }
}).catch((error) => {
  logger.error("Stripe failed to load", "stripeConfig", error);
});

export default stripePromise;