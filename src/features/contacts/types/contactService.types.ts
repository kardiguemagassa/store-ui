import type { ActionDataErrors } from '../../../shared/types/errors.types';


export interface BackendContactMessage {
  // Format snake_case (typique des réponses Spring/JPA)
  contact_id?: number;
  mobile_number?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  
  // Format camelCase 
  contactId?: number;
  mobileNumber?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  
  // Champs communs
  name: string;
  email: string;
  message: string;
  status?: 'OPEN' | 'CLOSED';
}

// Format frontend (camelCase)
export interface ContactMessage {
  contactId?: number;
  name: string;
  email: string;
  mobileNumber: string;
  message: string;
  status?: 'OPEN' | 'CLOSED';
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Données de soumission
export interface ContactData {
  name: string;
  email: string;
  mobileNumber: string;
  message: string;
}

// Résultat de soumission
export interface ContactSubmitResult {
  success: boolean;
  contactId?: number;
  error?: string;
  validationErrors?: ActionDataErrors;
}

// Filtres
export interface MessageFilters {
  status?: 'OPEN' | 'CLOSED';
  onlyOpen?: boolean;
}

// Données d'action pour React Router
export interface ContactActionData {
  success?: boolean;
  error?: string;
  validationErrors?: ActionDataErrors;
}

// Réponse API standard de Spring Boot
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  data: T;
  errorCode?: string;
  errors?: Record<string, string>;
  traceId?: string;
}

//Spécialisation pour les messages
export type MessagesApiResponse = ApiResponse<BackendContactMessage[]>;