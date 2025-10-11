//représente un contact dans la base de données
export interface Contacts {
    id?: number;
    name: string;
    email: string;
    mobileNumber: string;
    message: string;
    createdAt?: string;
    phone?: string;
    address?: string;
}

//Informations de contact de l'entreprise
export interface ContactInfo {
    phone: string;
    email: string;
    address: string;
}

/**
 * Validation retournées par le backend Spring Boot
 * Correspond à la structure des erreurs de @Valid dans Spring
 */
export interface ContactValidationErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  message?: string;
}

 //Données retournées par l'action au composant React
export interface ContactActionData {
    success?: boolean;
    error?: string;
    validationErrors?: ContactValidationErrors;
}

//Réponse d'erreur du backend Spring Boot
export interface BackendErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  errors?: ContactValidationErrors;
}