import type { User, Address } from "../types/auth";
import { getSafeCountryCode } from "./countryUtils";

// Type pour l'adresse Stripe
interface StripeAddress {
  line1: string;
  city: string;
  country: string;
  state?: string;
  postal_code?: string;
}

// Type pour les billing details Stripe
interface StripeBillingDetails {
  name: string;
  email: string;
  phone?: string;
  address?: StripeAddress;
}

export function userToBillingDetails(user: User): StripeBillingDetails {
  const billingDetails: StripeBillingDetails = {
    name: user.name,
    email: user.email || "customer@example.com",
  };

  if (user.mobileNumber) {
    billingDetails.phone = user.mobileNumber;
  }

  if (user.address && isValidAddress(user.address)) {
    billingDetails.address = addressToStripeAddress(user.address);
  }

  return billingDetails;
}

export function addressToStripeAddress(address: Address): StripeAddress {
  const countryCode = getSafeCountryCode(address.country);
  
  const stripeAddress: StripeAddress = {
    line1: address.street,
    city: address.city,
    country: countryCode,
  };

  if (address.state) {
    stripeAddress.state = address.state;
  }
  if (address.postalCode) {
    stripeAddress.postal_code = address.postalCode;
  }

  return stripeAddress;
}

export function isValidAddress(address: Address): boolean {
  return !!(address.street && address.city && address.country);
}