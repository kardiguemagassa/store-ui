// TYPES PRINCIPAUX
export interface SuccessResponseDto {
  message: string;
  timestamp: string;
  path?: string;
}

export interface ErrorResponseDto {
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
  errors?: Record<string, string>;
}

export interface LoginResponseDto {
  message: string;
  user: {
    id: number;
    name: string;
    email?: string;
    username?: string;
    mobileNumber?: string;
    roles: string[];
    enabled: boolean;
    accountNonExpired: boolean;
    credentialsNonExpired: boolean;
    accountNonLocked: boolean;
  };
  jwtToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T = unknown> {
  status: "SUCCESS" | "ERROR";
  message: string;
  data?: T;
  timestamp?: string;
  path?: string;
  errors?: Record<string, string>;
}

// ERREURS API
export interface ApiError {
  response?: {
    status: number;
    data?: ErrorResponseDto | Record<string, string> | ApiResponse | string;
  };
  message?: string;
  status?: number;
  code?: string;
}

// ERREURS DE FORMULAIRE
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

// TYPE GÉNÉRIQUE POUR TOUTES LES ACTIONS
export interface ActionData<T = unknown> {
  success?: boolean;
  errors?: ActionDataErrors;
  formData?: T;
  message?: string;
  redirectTo?: string;
}

// TYPES SPÉCIFIQUES POUR L'AUTH
export type AuthActionData = ActionData<{
  email: string;
  username?: string;
  stayLoggedIn?: boolean;
}>;

export type RegisterActionData = ActionData<{
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
}>;

export type LoginActionData = ActionData<{
  username: string;
  password: string;
  rememberMe?: boolean;
}>;

export interface LegacyActionData {
  success?: boolean;
  errors?: ActionDataErrors;
  profileData?: unknown;
  message?: string;
}

// TYPES COMPLÉMENTAIRES
export interface NetworkError {
  type: 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'SERVER_ERROR';
  message: string;
  originalError?: unknown;
}

// Détecte l'environnement sans process.env - DÉPLACÉ AVANT LE LOGGER
export const getEnvironment = (): 'development' | 'production' => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === ''
    ? 'development' 
    : 'production';
};

// TYPE GUARDS UNIFIÉS
const isErrorResponseDto = (data: unknown): data is ErrorResponseDto => {
  return (
    typeof data === 'object' && 
    data !== null && 
    'errorCode' in data && 
    'message' in data
  );
};

const isApiResponse = (data: unknown): data is ApiResponse => {
  return typeof data === 'object' && data !== null && 'status' in data;
};

const isValidationErrors = (data: unknown): data is Record<string, string> => {
  if (typeof data !== 'object' || data === null) return false;
  return Object.values(data).every(value => typeof value === 'string');
};

const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && ('response' in error || 'message' in error);
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return typeof error === 'object' && error !== null && 'type' in error;
};

// LOGGER PROFESSIONNEL CORRIGÉ
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Initialiser dans le constructeur
    this.isDevelopment = getEnvironment() === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    const levelPriority = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    const currentLevel = this.isDevelopment ? 'debug' : 'warn';
    return levelPriority[level] >= levelPriority[currentLevel];
  }

  private log(level: LogLevel, message: string, context?: string, error?: unknown, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';

    // FORMATAGE PROFESSIONNEL - Évite "non disponible"
    if (this.isDevelopment) {
      // Développement : format lisible avec couleurs
      const styles = {
        error: 'color: red; font-weight: bold;',
        warn: 'color: orange; font-weight: bold;',
        info: 'color: blue; font-weight: bold;',
        debug: 'color: gray;'
      };

      const timeStr = timestamp.split('T')[1].split('.')[0]; // HH:MM:SS
      
      console.log(
        `%c[${timeStr}] %c${level.toUpperCase()}%c ${contextStr} ${message}`,
        'color: gray',
        styles[level],
        'color: inherit',
        ...this.formatMetadata(metadata, error)
      );
    } else {
      // Production : format JSON structuré
      const logEntry = {
        timestamp,
        level,
        context,
        message,
        error: error instanceof Error ? error.message : undefined,
        ...metadata
      };
      console.log(JSON.stringify(logEntry));
    }

    // Appel correct avec les paramètres individuels
    this.sendToLoggingService(timestamp, level, message, context, error, metadata);
  }

  private formatMetadata(metadata?: Record<string, unknown>, error?: unknown): unknown[] {
    const result: unknown[] = [];
    
    if (metadata && Object.keys(metadata).length > 0) {
      result.push(metadata);
    }
    
    if (error instanceof Error) {
      result.push({
        error: error.message,
        ...(this.isDevelopment && { stack: error.stack })
      });
    } else if (error) {
      result.push({ error });
    }
    
    return result;
  }

  private sendToLoggingService(
    timestamp: string,
    level: LogLevel,
    message: string,
    context?: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.isDevelopment) {
      // En production, envoyer à un service externe
      // Exemple: Sentry, LogRocket, etc.
      // window._sentry?.captureException(error);
      
      // Pour l'instant, on log en JSON pour la production
      const logEntry = {
        timestamp,
        level,
        context,
        message,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        metadata
      };
      
      // Simulation d'envoi à un service externe
      console.log('📡 Logging service:', JSON.stringify(logEntry));
    }
  }

  error(message: string, context?: string, error?: unknown, metadata?: Record<string, unknown>): void {
    this.log('error', message, context, error, metadata);
  }

  warn(message: string, context?: string, error?: unknown, metadata?: Record<string, unknown>): void {
    this.log('warn', message, context, error, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, context, undefined, metadata);
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, context, undefined, metadata);
  }
}

export const logger = new Logger();

// FONCTIONS D'EXPORT POUR LA COMPATIBILITÉ
export const logErrorSafely = (error: unknown, context?: string, metadata?: Record<string, unknown>): void => {
  const message = error instanceof Error ? error.message : 'Une erreur est survenue';
  logger.error(message, context, error, metadata);
};

// GESTIONNAIRE D'ERREURS API PRINCIPAL
export const handleApiError = (error: unknown): { 
  message: string; 
  errors?: ActionDataErrors;
  status?: number;
} => {
  // Log technique détaillé
  logger.debug('Traitement erreur API', 'handleApiError', { error });

  // Erreur non-API
  if (!isApiError(error)) {
    return {
      message: "Une erreur inattendue s'est produite"
    };
  }

  const apiError = error;

  // EXTRACTION DES DONNÉES DE RÉPONSE
  const responseData = apiError.response?.data;
  const status = apiError.response?.status;

  // CAS 1: FORMAT ErrorResponseDto (V4)
  if (responseData && isErrorResponseDto(responseData)) {
    const errorDto = responseData;
    
    if (errorDto.errors && Object.keys(errorDto.errors).length > 0) {
      return {
        message: errorDto.message || "Veuillez corriger les erreurs du formulaire",
        errors: errorDto.errors as ActionDataErrors,
        status
      };
    }
    
    return {
      message: errorDto.message,
      status
    };
  }

  // CAS 2: ERREURS DE VALIDATION DIRECTES (400)
  if (status === 400 && responseData) {
    // Format Map<String, String> direct
    if (isValidationErrors(responseData)) {
      return {
        message: "Veuillez corriger les erreurs du formulaire",
        errors: responseData as ActionDataErrors,
        status
      };
    }
    
    // Format Spring ValidationError standard
    if (typeof responseData === 'string' && responseData.includes('validation')) {
      return {
        message: "Données de formulaire invalides",
        status
      };
    }
  }

  // CAS 3: FORMAT ApiResponse
  if (responseData && isApiResponse(responseData)) {
    const apiResponse = responseData;
    
    if (apiResponse.status === "ERROR") {
      if (apiResponse.errors) {
        return {
          message: apiResponse.message || "Veuillez corriger les erreurs du formulaire",
          errors: apiResponse.errors as ActionDataErrors,
          status
        };
      }
      
      return {
        message: apiResponse.message,
        status
      };
    }
  }

  // CAS 4: ERREURS HTTP STANDARD
  if (status) {
    const statusMessages: Record<number, string> = {
      400: "Requête invalide - Données incorrectes",
      401: "Non authentifié - Veuillez vous reconnecter",
      403: "Accès refusé - Permissions insuffisantes",
      404: "Ressource non trouvée",
      409: "Conflit - La ressource existe déjà",
      429: "Trop de tentatives - Veuillez patienter",
      500: "Erreur interne du serveur",
      502: "Service temporairement indisponible",
      503: "Service en maintenance",
      504: "Timeout du serveur"
    };
    
    return {
      message: statusMessages[status] || `Erreur ${status}`,
      status
    };
  }

  // CAS 5: ERREURS RÉSEAU/FRONTEND
  if (apiError.message) {
    const networkMessages: Record<string, string> = {
      "Network Error": "Problème de connexion - Vérifiez votre internet",
      "timeout of": "La requête a expiré - Réessayez",
      "Request failed": "Échec de la requête - Réessayez",
      "ECONNREFUSED": "Serveur inaccessible"
    };
    
    const networkMessage = Object.keys(networkMessages).find(key => 
      apiError.message?.includes(key)
    );
    
    return {
      message: networkMessage ? networkMessages[networkMessage] : apiError.message
    };
  }

  // CAS 6: ERREUR GÉNÉRIQUE
  return {
    message: "Une erreur inattendue s'est produite"
  };
};

// FONCTIONS UTILITAIRES SPÉCIALISÉES

// Extrait uniquement les erreurs de validation
export const extractValidationErrors = (error: unknown): ActionDataErrors | undefined => {
  const errorInfo = handleApiError(error);
  return errorInfo.errors;
};

// Version simplifiée pour les composants
export const getErrorMessage = (error: unknown): string => {
  return handleApiError(error).message;
};

// Pour les formulaires React Router
export const handleError = (error: unknown): string => {
  return getErrorMessage(error);
};

// GESTION SPÉCIFIQUE POUR L'AUTH
export const handleAuthError = (error: unknown): { 
  message: string; 
  fieldErrors?: ActionDataErrors;
} => {
  const errorInfo = handleApiError(error);
  
  // Personnalisation des messages d'auth
  if (errorInfo.status === 401) {
    return {
      message: "Email ou mot de passe incorrect",
      fieldErrors: { general: "Identifiants invalides" }
    };
  }
  
  if (errorInfo.status === 403) {
    return {
      message: "Compte désactivé ou non autorisé",
      fieldErrors: { general: "Accès refusé" }
    };
  }
  
  // Erreurs de validation spécifiques au login/register
  if (errorInfo.status === 400 && errorInfo.errors) {
    const authErrors: ActionDataErrors = {};
    
    if (errorInfo.errors.password) {
      authErrors.password = "Le mot de passe doit contenir : 8+ caractères, majuscule, minuscule, chiffre, caractère spécial (@$!%*?&#)";
    }
    
    if (errorInfo.errors.email || errorInfo.errors.username) {
      authErrors.email = "Format d'email invalide";
    }
    
    return {
      message: "Veuillez corriger les erreurs du formulaire",
      fieldErrors: { ...authErrors, ...errorInfo.errors }
    };
  }
  
  return errorInfo;
};