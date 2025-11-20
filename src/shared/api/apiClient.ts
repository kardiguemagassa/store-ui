import axios from "axios";
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import type { User } from "../../features/auth/types/auth.types";
import { handleApiError, logger } from "../types/errors.types";

/**
 * CLIENT HTTP - VERSION PROFESSIONNELLE
 * Gestion sécurisée des tokens JWT et CSRF
 */


interface LoginResponseDto {
  message: string;
  user: User;
  jwtToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface JwtClaims {
  sub?: string;
  userId?: number;
  name?: string;
  username?: string;
  email?: string;
  mobileNumber?: string;
  roles?: string | string[];
  exp?: number;
  iat?: number;
}

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ReduxStore {
  getState: () => {
    auth: {
      jwtToken: string | null;
      user: User | null;
      isAuthenticated: boolean;
    };
  };
  dispatch: (action: unknown) => void;
}

interface ReduxActions {
  loginSuccess: (payload: { jwtToken: string; user: User }) => unknown;
  logout: () => unknown;
}

// VARIABLES GLOBALES
let reduxStore: ReduxStore | null = null;
let reduxActions: ReduxActions | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// CONFIGURATION
export function configureApiClientStore(store: ReduxStore, actions: ReduxActions): void {
  reduxStore = store;
  reduxActions = actions;
  logger.info("Store Redux configuré", "ApiClient");
}

function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newAccessToken: string): void {
  refreshSubscribers.forEach(callback => callback(newAccessToken));
  refreshSubscribers = [];
}

// CLIENT AXIOS PRINCIPAL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  withCredentials: true, // Important pour les cookies CSRF
});


// GESTION DES TOKENS: Récupère le JWT depuis Redux ou localStorage
function getJwtToken(): string | null {
  if (reduxStore) {
    const jwt = reduxStore.getState().auth.jwtToken;
    if (jwt) return jwt;
  }
  
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (persistRoot) {
      const parsed = JSON.parse(persistRoot);
      if (parsed.auth) {
        const authState = JSON.parse(parsed.auth);
        return authState.jwtToken || null;
      }
    }
  } catch (error) {
    logger.error("Erreur lecture JWT localStorage", "ApiClient", error);
  }
  
  return null;
}

// Récupère le CSRF token depuis les cookies
function getCsrfToken(): string | null {
  // Méthode 1: js-cookie
  const token = Cookies.get("XSRF-TOKEN");
  if (token) {
    logger.debug("CSRF token récupéré", "ApiClient", { 
      source: "js-cookie",
      tokenLength: token.length 
    });
    return token;
  }

  // Méthode 2: Lecture manuelle
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN' || name === 'CSRF-TOKEN' || name === 'X-XSRF-TOKEN') {
      logger.debug("CSRF token récupéré manuellement", "ApiClient", { 
        source: "manual",
        cookieName: name,
        tokenLength: value.length 
      });
      return decodeURIComponent(value);
    }
  }

  logger.warn("CSRF token non trouvé", "ApiClient", {
    availableCookies: cookies.length
  });
  
  return null;
}

// Régénère le CSRF token si manquant
async function ensureCsrfToken(): Promise<boolean> {
  try {
    const csrfToken = getCsrfToken();
    
    if (!csrfToken) {
      logger.info("Régénération CSRF token", "ApiClient");
      
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/csrf-token`, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        logger.info("CSRF token régénéré avec succès", "ApiClient");
        return true;
      }
    }
    
    return !!csrfToken;
  } catch (error) {
    logger.error("Échec régénération CSRF token", "ApiClient", error);
    return false;
  }
}

// INTERCEPTEURS REQUÊTES
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "unknown";
    
    logger.debug("Préparation requête", "ApiClient", {
      method,
      url,
      hasData: !!config.data
    });

    // 1. Ajouter le JWT
    const jwtToken = getJwtToken();
    if (jwtToken && config.headers) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    // 2. Gestion CSRF pour les méthodes non-safe
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (!safeMethods.includes(method)) {
      let csrfToken = getCsrfToken();
      
      if (!csrfToken) {
        logger.debug("CSRF manquant, tentative régénération", "ApiClient", { method, url });
        await ensureCsrfToken();
        csrfToken = getCsrfToken();
      }
      
      if (csrfToken && config.headers) {
        config.headers["X-XSRF-TOKEN"] = csrfToken;
      } else {
        logger.warn("CSRF token toujours manquant après régénération", "ApiClient", { method, url });
      }
    }

    logger.debug("Headers configurés", "ApiClient", {
      hasJWT: !!jwtToken,
      hasCSRF: !!config.headers?.["X-XSRF-TOKEN"],
      method,
      url
    });

    return config;
  },
  (error: AxiosError) => {
    logger.error("Erreur intercepteur requête", "ApiClient", error);
    return Promise.reject(error);
  }
);

// INTERCEPTEURS RÉPONSES

// Intercepteur 1: Déballage réponse et gestion CSRF
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const url = response.config.url || "unknown";
    
    logger.debug("Réponse reçue", "ApiClient", {
      status: response.status,
      url,
      hasData: !!response.data
    });

    // Détection nouveau CSRF token
    const newCsrfToken = response.headers['x-xsrf-token'];
    if (newCsrfToken) {
      logger.debug("Nouveau CSRF token reçu", "ApiClient", { url });
    }

    // Déballage ApiResponse pour les endpoints non-auth
    if (!response.config.url?.includes('/auth/')) {
      if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        response.data = response.data.data;
      }
    }
    
    return response;
  },
  (error) => Promise.reject(error)
);

// Intercepteur 2: Gestion erreurs et refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;
    const url = originalRequest?.url || "unknown";
    const status = error.response?.status;

    // Log détaillé pour les erreurs d'autorisation
    if (status === 403) {
      logger.warn("Accès refusé (403)", "ApiClient", {
        url,
        method: originalRequest?.method,
        hasJWT: !!originalRequest?.headers?.Authorization,
        hasCSRF: !!originalRequest?.headers?.["X-XSRF-TOKEN"]
      });
    }
    
    // Gestion refresh token pour les 401
    if (status === 401 && originalRequest && !originalRequest._retry) {
      
      // Ignorer les endpoints d'auth
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }
      
      const hasToken = getJwtToken();
      
      if (!hasToken) {
        logger.info("Redirection login - token manquant", "ApiClient");
        window.location.href = "/login?session=expired";
        return Promise.reject(error);
      }
      
      // Gestion concurrente des refresh
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newAccessToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        logger.info("Tentative refresh token", "ApiClient", { url });
        const newAccessToken = await refreshAccessToken();
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        onTokenRefreshed(newAccessToken);
        isRefreshing = false;
        
        logger.info("Refresh token réussi", "ApiClient", { url });
        return apiClient(originalRequest);
        
      } catch (refreshError: unknown) {
        isRefreshing = false;
        refreshSubscribers = [];
        
        logger.error("Échec refresh token", "ApiClient", refreshError);
        
        if (reduxActions && reduxStore) {
          reduxStore.dispatch(reduxActions.logout());
        }
        
        window.location.href = "/login?session=expired";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

//UTILITAIRES: Rafraîchit le token d'accès
async function refreshAccessToken(): Promise<string> {
  try {
    const response = await axios.post<LoginResponseDto>(
      `${import.meta.env.VITE_API_BASE_URL as string}/api/v1/auth/refresh`,
      {},
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    );
    
    const { jwtToken, user } = response.data;
    
    if (reduxActions && reduxStore) {
      reduxStore.dispatch(reduxActions.loginSuccess({jwtToken: jwtToken, user: user}));
    } else {
      throw new Error('Store Redux non initialisé');
    }
    
    return jwtToken;
    
  } catch (error: unknown) {
    const errorInfo = handleApiError(error);
    logger.error("Erreur refresh token", "ApiClient", error, {
      errorCode: errorInfo.status,
      errorMessage: errorInfo.message
    });
    throw error;
  }
}

// Décode un JWT pour extraire les informations utilisateur
function decodeJWT(token: string): User {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Format JWT invalide');
    }
    
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(decodedPayload) as JwtClaims;
    
    const user: User = {
      id: claims.userId || parseInt(claims.sub || '0', 10),
      name: claims.name || claims.username,
      email: claims.email,
      username: claims.username,
      mobileNumber: claims.mobileNumber,
      roles: parseRoles(claims.roles),
      enabled: true,
      accountNonExpired: true,
      credentialsNonExpired: true,
      accountNonLocked: true
    };
    
    return user;
    
  } catch (error: unknown) {
    logger.error("Erreur décodage JWT", "ApiClient", error);
    throw new Error('Token JWT invalide');
  }
}

function parseRoles(roles: string | string[] | undefined): string[] {
  if (!roles) {
    return ['ROLE_USER'];
  }
  
  if (Array.isArray(roles)) {
    return roles;
  }
  
  if (typeof roles === 'string') {
    return roles.split(',').map(role => role.trim());
  }
  
  return ['ROLE_USER'];
}

export function getUserFromJWT(token: string): User {
  return decodeJWT(token);
}

export type { LoginResponseDto };

export default apiClient;