import axios from "axios";
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { handleApiError } from "../types/errors";

/**
 * CLIENT HTTP CONFIGURÉ
 * Instance Axios pré-configurée avec les paramètres de base de l'application
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // URL de l'API depuis les variables d'environnement
  headers: {
    "Content-Type": "application/json", // Format des données envoyées
    Accept: "application/json",         // Format des données attendues en réponse
  },
  timeout: 10000,                       // Délai maximum d'attente (10 secondes)
  withCredentials: true,                // Inclure les cookies dans les requêtes
});

/**
 * INTERCEPTEUR DE REQUÊTES
 * Exécuté avant chaque requête HTTP pour ajouter des en-têtes d'authentification
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // AJOUT DU TOKEN JWT D'AUTHENTIFICATION
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    
    // GESTION DU TOKEN CSRF POUR LES REQUÊTES MODIFIANT LES DONNÉES
    const safeMethods = ["GET", "HEAD", "OPTIONS"]; // Méthodes sans effet de bord
    const method = config.method?.toUpperCase() || "GET"; 
    
    if (!safeMethods.includes(method)) {
      // Les méthodes non-safe (POST, PUT, DELETE, PATCH) nécessitent un token CSRF
      let csrfToken = Cookies.get("XSRF-TOKEN");
      
      if (!csrfToken) {
        // Récupération du token CSRF si absent
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/csrf-token`, {
          withCredentials: true,
        });
        csrfToken = Cookies.get("XSRF-TOKEN");
        
        if (!csrfToken) {
          throw new Error("Failed to retrieve CSRF token from cookies");
        }
      }
      
      // Ajout du token CSRF dans les en-têtes
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error: AxiosError) => {
    // GESTION DES ERREURS LORS DE LA PRÉPARATION DE LA REQUÊTE
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTEUR DE RÉPONSES  
 * Exécuté après chaque réponse HTTP pour gérer les erreurs globalement
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // RÉPONSE SUCCÈS - Retourne la réponse telle quelle
    return response;
  },
  async (error: AxiosError) => {
    // SYSTÈME CENTRALISÉ DE GESTION D'ERREURS
    // handleApiError transforme les erreurs techniques en messages utilisateur compréhensibles
    const errorInfo = handleApiError(error);
    
    // JOURNALISATION UNIFORME DES ERREURS
    console.error("Erreur API:", {
      status: error.response?.status,    // Code HTTP (400, 401, 500, etc.)
      url: error.config?.url,           // Endpoint appelé
      message: errorInfo.message,       // Message formaté pour l'utilisateur
    });

    // DÉCONNEXION AUTOMATIQUE EN CAS DE SESSION EXPIRÉE
    if (error.response?.status === 401) {
      const jwtToken = localStorage.getItem("jwtToken");
      if (jwtToken) {
        // NETTOYAGE DU STOCKAGE LOCAL
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        
        // REDIRECTION VERS LA PAGE DE CONNEXION
        window.location.href = "/login?session=expired";
      }
    }
    
    /**
     * IMPORTANT : Rejet de l'erreur originale
     * - Permet à chaque action (loginAction, profileAction, etc.) 
     *   d'utiliser handleApiError pour une gestion métier spécifique
     * - Garde les informations techniques pour le debugging
     * - Laisse la flexibilité de transformation côté métier
     */
    return Promise.reject(error);
  }
);

export default apiClient;