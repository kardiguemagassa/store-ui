/**
 * Interface : représente un contact dans la base de données
 */
export interface Contacts {
    id?: number;
    name: string;
    email: string;
    mobileNumber: string;
    message: string;
    createdAt?: string;
}

/**
 * Interface : erreurs de validation retournées par le backend Spring Boot
 * Correspond à la structure des erreurs de @Valid dans Spring
 */
export interface ContactValidationErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  message?: string;
}

/**
 * Interface : données retournées par l'action au composant React
 */
export interface ContactActionData {
    success?: boolean;
    error?: string;
    validationErrors?: ContactValidationErrors;
}

/**
 * Interface : structure complète de la réponse d'erreur du backend Spring Boot
 */
export interface BackendErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  errors?: ContactValidationErrors;
}