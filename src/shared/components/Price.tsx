import { logErrorSafely } from "../types/errors.types";

interface PriceProps {
  price: number;
  currency?: string; 
  className?: string;
  locale?: string;
}

export default function Price({ 
  price, 
  currency = 'EUR',
  className = '',
  locale = 'fr-FR'
}: PriceProps) {
 
  const formattedPrice = formatPriceSafe(price, currency, locale);
  
  return (
    <span className={className} title={`${price} ${currency}`}>
      {formattedPrice}
    </span>
  );
}

function formatPriceSafe(
  price: number, 
  currency: string, 
  locale: string
): string {
  // Validation robuste
  if (typeof price !== 'number' || isNaN(price) || !isFinite(price)) {
    logErrorSafely(
      new Error(`Prix invalide: ${price}`), 
      'PriceValidation',
      { price, currency, locale }
    );
    return fallbackFormat(0, currency);
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(price);
 
  } catch (error) {
    // Log structuré avec contexte
    logErrorSafely(error, 'PriceFormatting', {
      price,
      currency, 
      locale
    });
    
    // Fallback user-friendly
    return fallbackFormat(price, currency);
  }
}

function fallbackFormat(price: number, currency: string): string {
  const formattedNumber = price.toLocaleString('fr-FR', {minimumFractionDigits: 2,maximumFractionDigits: 2});
  return `${formattedNumber} ${currency}`;
}