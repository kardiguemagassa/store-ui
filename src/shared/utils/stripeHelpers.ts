import { getSafeCountryCode } from "./countryUtils";
import type { Address, User } from "../../features/auth/types/auth.types";
import { getErrorMessage, logger } from "../types/errors.types";

interface StripeAddress {
  line1: string;
  city: string;
  country: string;
  state?: string;
  postal_code?: string;
}

interface StripeBillingDetails {
  name: string;
  email: string;
  phone?: string;
  address?: StripeAddress;
}

/**
 * TRANSFORMATION UTILISATEUR → DETAILS DE FACTURATION STRIPE
 * Convertit les données utilisateur en format compatible Stripe pour le paiement
 * 
 * @param user - L'utilisateur connecté avec adresse obligatoire
 * @returns Les billing details formatés pour Stripe
 */
export function userToBillingDetails(user: User & { address: Address }): StripeBillingDetails {
  if (!user.name) {
    throw new Error("Le nom utilisateur est requis pour Stripe");
  }
  
  if (!isValidAddress(user.address)) {
    throw new Error("L'adresse utilisateur est invalide pour Stripe");
  }

  try {
    const billingDetails: StripeBillingDetails = {
      name: user.name,
      email: user.email || "customer@example.com",
    };

    if (user.mobileNumber) {
      billingDetails.phone = user.mobileNumber;
    }

    // ADRESSE pour garantir la validation du payement 
    billingDetails.address = addressToStripeAddress(user.address);

    logger.info("Transformation utilisateur → Stripe réussie", "StripeUtils", {
      userName: user.name,
      hasPhone: !!user.mobileNumber,
      hasAddress: !!user.address
    });

    return billingDetails;
    
  } catch (error) {
    logger.error("Erreur transformation utilisateur → Stripe", "StripeUtils", error, {
      userName: user.name,
      userEmail: user.email
    });
    throw new Error("Impossible de préparer les informations de paiement");
  }
}

/**
 * TRANSFORMATION ADRESSE → FORMAT STRIPE
 * Adapte l'adresse utilisateur au format attendu par Stripe
 * 
 * @param address - L'adresse de l'utilisateur
 * @returns L'adresse formatée pour Stripe
 */
export function addressToStripeAddress(address: Address): StripeAddress {
  try {
    // VALIDATION ET NORMALISATION DU CODE PAYS
    const countryCode = getSafeCountryCode(address.country);
    
    // CRÉATION DE L'ADRESSE STRIPE
    const stripeAddress: StripeAddress = {
      line1: address.street,
      city: address.city,  
      country: countryCode,
    };

    // CHAMPS OPTIONNELS
    if (address.state) {
      stripeAddress.state = address.state;
    }
    if (address.postalCode) {
      stripeAddress.postal_code = address.postalCode;
    }

    logger.debug("Transformation adresse Stripe réussie", "StripeUtils", {
      countryCode,
      hasState: !!address.state,
      hasPostalCode: !!address.postalCode
    });

    return stripeAddress;
    
  } catch (error) {
    logger.error("Erreur transformation adresse Stripe", "StripeUtils", error, {
      country: address.country,
      city: address.city
    });
    throw new Error("Format d'adresse incompatible avec le système de paiement");
  }
}

/**
 * VALIDATION D'ADRESSE
 * Vérifie qu'une adresse contient les champs obligatoires pour Stripe
 * 
 * @param address - L'adresse à valider
 * @returns true si l'adresse est valide pour Stripe
 */
export function isValidAddress(address: Address): boolean {
  const isValid = !!(address.street && address.city && address.country);
  
  if (!isValid) {
    logger.warn("Adresse invalide détectée", "StripeUtils", {
      hasStreet: !!address.street,
      hasCity: !!address.city,
      hasCountry: !!address.country
    });
  }
  
  return isValid;
}

/**
 * TRANSFORMATION UTILISATEUR → STRIPE AVEC GESTION D'ERREURS
 * Version sécurisée qui utilise le système d'erreurs centralisé
 * 
 * @param user - L'utilisateur avec adresse
 * @returns StripeBillingDetails ou lance une erreur formatée
 */
export function safeUserToBillingDetails(user: User & { address: Address }): StripeBillingDetails {
  try {
    return userToBillingDetails(user);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    
    logger.error("Erreur sécurisée transformation Stripe", "StripeUtils", error, {
      userName: user.name,
      userEmail: user.email,
      originalError: errorMessage
    });
    
    throw new Error(`Configuration paiement impossible: ${errorMessage}`);
  }
}