// Mapping des noms de pays vers codes ISO
export const countryNameToCode: Record<string, string> = {
  'france': 'FR',
  'united states': 'US',
  'united states of america': 'US',
  'usa': 'US',
  'canada': 'CA',
  'united kingdom': 'GB',
  'great britain': 'GB',
  'germany': 'DE',
  'spain': 'ES',
  'italy': 'IT',
  'australia': 'AU',
  'japan': 'JP',
  'china': 'CN',
  'india': 'IN',
  'brazil': 'BR',
  'mexico': 'MX',
  'netherlands': 'NL',
  'belgium': 'BE',
  'switzerland': 'CH',
  'portugal': 'PT',
  'mali': 'ML'
  // Ajouter d'autres pays selon vos besoins
};

// Fonction pour convertir un nom de pays en code ISO
export function getCountryCode(countryName: string): string {
  if (!countryName) return '';
  
  const normalized = countryName.trim().toLowerCase();
  
  // Si c'est déjà un code à 2 caractères, le retourner
  if (/^[A-Z]{2}$/i.test(countryName)) {
    return countryName.toUpperCase();
  }
  
  // Chercher dans le mapping
  return countryNameToCode[normalized] || '';
}

// Fonction pour valider un code pays
export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

// Fonction pour obtenir le code pays avec fallback
export function getSafeCountryCode(userCountry: string | undefined): string {
  if (!userCountry) return 'US'; // Fallback par défaut
  
  const code = getCountryCode(userCountry);
  return isValidCountryCode(code) ? code : 'US'; // Fallback si code invalide
}