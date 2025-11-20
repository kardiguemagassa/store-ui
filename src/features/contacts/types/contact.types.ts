import type { ActionDataErrors } from '../../../shared/types/errors.types';

// Informations de contact de l'entreprise
export interface ContactInfoData {
  phone: string;
  email: string;
  address: string;
}

// Données d'action pour React Router
export interface ContactActionData {
  success?: boolean;
  error?: string;
  validationErrors?: ActionDataErrors;
}

// Erreurs de validation
export interface ContactValidationErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  message?: string;
}

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