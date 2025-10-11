import type { User, Address } from "../types/auth";
import { getSafeCountryCode } from "./countryUtils";
import { getErrorMessage } from "../types/errors"; 

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

    //ADRESSE pour garantir la validation du payement 
    billingDetails.address = addressToStripeAddress(user.address);

    return billingDetails;
    
  } catch (error) {
    console.error("Erreur lors de la transformation utilisateur → Stripe:", error);
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

    return stripeAddress;
    
  } catch (error) {
    console.error("Erreur transformation adresse Stripe:", error);
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
  return !!(address.street && address.city && address.country);
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
    
    console.error("Erreur sécurisée transformation Stripe:", {
      error: errorMessage,
      user: { name: user.name, email: user.email }
    });
    
    throw new Error(`Configuration paiement impossible: ${errorMessage}`);
  }
}