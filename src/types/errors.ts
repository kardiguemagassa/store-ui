import type { ProfileData } from "./profile";

// Réponse standardisée de  backend
export interface ApiResponse<T = unknown> {
  status: "SUCCESS" | "ERROR";   
  message: string;              
  data?: T;                      
  timestamp?: string;            
  path?: string;                
  errors?: Record<string, string>; // erreurs de validation
}

// erreurs API
export interface ApiError {
  response?: {
    status: number;
    data?: ApiResponse;          // Récuperer errur backend
  };
  message?: string;              // ERREUR FRONTEND
  status?: number;               // ERREUR RÉSEAU
  code?: string;                 // ERREUR RÉSEAU
}

// erreurs de formulaire
export interface ActionDataErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
  confirmPwd?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  general?: string;
  [key: string]: string | undefined;
}

// réponses d'action
export interface ActionData {
  success?: boolean;
  errors?: ActionDataErrors;
  profileData?: ProfileData & { emailUpdated?: boolean };
}

// FONCTION PRINCIPALE CORRIGÉE
export const handleApiError = (error: unknown): { message: string; errors?: ActionDataErrors } => {
  const apiError = error as ApiError;
  
  console.log("Erreur API détaillée:", apiError);

  // CAS 1: ERREURS BACKEND DE VALIDATION (400 Bad Request)
  // GlobalExceptionHandler retourne Map<string, string> pour MethodArgumentNotValidException
  if (apiError.response?.status === 400 && apiError.response.data) {
    // Si c'est directement un objet d'erreurs de validation (format GlobalExceptionHandler)
    if (typeof apiError.response.data === 'object' && !('status' in apiError.response.data)) {
      return {
        message: "Veuillez corriger les erreurs du formulaire",
        errors: apiError.response.data as ActionDataErrors
      };
    }
    
    // Si c'est  ResponseDto avec des erreurs de validation
    if (apiError.response.data.errors) {
      return {
        message: apiError.response.data.message || "Veuillez corriger les erreurs du formulaire",
        errors: apiError.response.data.errors as ActionDataErrors
      };
    }
  }

  // CAS 2: ERREUR BACKEND AVEC NOUVEAU FORMAT
  // ResponseDto avec status: "ERROR"
  if (apiError.response?.data?.status === "ERROR") {
    return {
      message: apiError.response.data.message //Message principal du backend
    };
  }

  // CAS 3: ERREUR BACKEND GÉNÉRIQUE (message direct)
  if (apiError.response?.data?.message) {
    return {
      message: apiError.response.data.message
    };
  }

  // CAS 4: ERREURS HTTP STANDARD
  if (apiError.response?.status) {
    const statusMessages: Record<number, string> = {
      401: "Non authentifié - Veuillez vous reconnecter",
      403: "Accès refusé - Vous n'avez pas les permissions nécessaires",
      404: "Ressource non trouvée",
      500: "Erreur interne du serveur - Notre équipe a été alertée",
      502: "Service temporairement indisponible",
      503: "Service en maintenance",
      504: "Timeout du serveur"
    };
    
    return {
      message: statusMessages[apiError.response.status] || `Erreur ${apiError.response.status}`
    };
  }

  // CAS 5: ERREURS FRONTEND/RÉSEAU
  if (apiError.message) {
    const networkMessages: Record<string, string> = {
      "Network Error": "Problème de connexion - Vérifiez votre internet",
      "timeout of": "La requête a expiré - Réessayez",
      "Request failed": "Échec de la requête - Réessayez"
    };
    
    const networkMessage = Object.keys(networkMessages).find(key => 
      apiError.message?.includes(key)
    );
    
    return {
      message: networkMessage ? networkMessages[networkMessage] : apiError.message
    };
  }

  // CAS 6: ERREUR INCONNUE
  return {
    message: "Une erreur inattendue s'est produite"
  };
};

// FONCTION SPÉCIFIQUE POUR LA VALIDATION DE FORMULAIRE
export const extractValidationErrors = (error: unknown): ActionDataErrors | undefined => {
  const apiError = error as ApiError;
  
  // Pour les erreurs 400 de validation
  if (apiError.response?.status === 400 && apiError.response.data) {
    // Format direct du GlobalExceptionHandler
    if (typeof apiError.response.data === 'object' && !('status' in apiError.response.data)) {
      return apiError.response.data as ActionDataErrors;
    }
    
    // Format ResponseDto avec erreurs
    if (apiError.response.data.errors) {
      return apiError.response.data.errors as ActionDataErrors;
    }
  }
  
  return undefined;
};

// POUR LES COMPOSANTS
export const handleError = (error: unknown): string => {
  const errorInfo = handleApiError(error);
  return errorInfo.message;
};

// EXTRACTER LE MESSAGE D'ERREUR SEULEMENT
export const getErrorMessage = (error: unknown): string => {
  return handleApiError(error).message;
};