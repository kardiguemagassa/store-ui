// store/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "../types/auth";
import { getErrorMessage } from "../types/errors"; 

// HELPER POUR CHARGER LES DONNÉES DEPUIS LE LOCALSTORAGE
const loadAuthFromStorage = (): Pick<AuthState, 'jwtToken' | 'user' | 'isAuthenticated'> => {
  try {
    // Récupère le token JWT et les infos utilisateur depuis le localStorage
    const jwtToken = localStorage.getItem("jwtToken");
    const userStr = localStorage.getItem("user");
    
    if (jwtToken && userStr) {
      const user = JSON.parse(userStr) as User; // Transforme la string JSON en objet User
      return {
        jwtToken,
        user,
        isAuthenticated: true, // L'utilisateur est considéré comme connecté
      };
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error loading auth from localStorage:", errorMessage);
  }
  
  // Retourne l'état par défaut si:
  // Pas de données dans le localStorage
  // Erreur de lecture/parsing
  return {
    jwtToken: null,
    user: null,
    isAuthenticated: false,
  };
};

// INITIALISATION DE L'ÉTAT
const storageData = loadAuthFromStorage(); // Charge les données au démarrage

// INTERFACE ÉTENDUE POUR GÉRER LES ERREURS
interface ExtendedAuthState extends AuthState {
  error: string | null; // Nouveau champ : stocke le message d'erreur
}

// ÉTAT INITIAL AVEC GESTION D'ERREURS
const initialState: ExtendedAuthState = {
  jwtToken: storageData.jwtToken,    // Token JWT (null si pas connecté)
  user: storageData.user,            // Infos utilisateur (null si pas connecté)
  isAuthenticated: storageData.isAuthenticated, // true si connecté
  isLoading: false,                  // Pour les indicateurs de chargement
  error: null,                       // NOUVEAU : Stocke les messages d'erreur
};

// CRÉATION DU SLICE REDUX (LE CŒUR DE LA LOGIQUE)
const authSlice = createSlice({
  name: "auth", // Nom du slice (pour le debugging)
  initialState, // État initial défini ci-dessus
  reducers: {
    // DÉBUT DE LA CONNEXION
    loginStart: (state) => {
      state.isLoading = true;   // Active l'indicateur de chargement
      state.error = null;       // Reset toute erreur précédente
    },
    
    // CONNEXION RÉUSSIE
    loginSuccess: (state, action: PayloadAction<{ jwtToken: string; user: User }>) => {
      const { jwtToken, user } = action.payload; // Données reçues
      
      // Met à jour l'état Redux
      state.jwtToken = jwtToken;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null; // Reset erreur car tout s'est bien passé
      
      // Sauvegarde dans le localStorage pour persister la connexion
      try {
        localStorage.setItem("jwtToken", jwtToken);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error saving to localStorage:", errorMessage);
        state.error = "Erreur de sauvegarde locale";
      }
    },
    
    // ÉCHEC DE LA CONNEXION
    loginFailure: (state, action: PayloadAction<string>) => {
      // MAINTENANT ACCEPTE UN MESSAGE D'ERREUR EN PARAMÈTRE
      state.isLoading = false;      // Stop le chargement
      state.error = action.payload; // STOCKE LE MESSAGE D'ERREUR POUR L'AFFICHER DANS L'UI
    },
    
    // DÉCONNEXION
    logout: (state) => {
      // Réinitialise tout l'état
      state.jwtToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null; //Reset erreur
      
      // Nettoie le localStorage
      try {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("Error clearing localStorage:", errorMessage);
      }
    },
    
  
    // NETTOYAGE DES ERREURS
    clearError: (state) => {
      //effacer manuellement les erreurs affichées
      state.error = null;
    },
    
    // MISE À JOUR DES INFOS UTILISATEUR
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Fusionne les anciennes et nouvelles infos utilisateur
        state.user = { ...state.user, ...action.payload };
        
        // Met à jour le localStorage
        try {
          localStorage.setItem("user", JSON.stringify(state.user));
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error("Error updating user in localStorage:", errorMessage);
        }
      }
    },
  },
});

// EXPORT DES ACTIONS (pour les utiliser dans les composants)
export const { 
  loginStart,     // Démarre la connexion
  loginSuccess,   // Connexion réussie
  loginFailure,   // Échec connexion (avec message d'erreur)
  logout,         // Déconnexion
  clearError,     // Nettoyer les erreurs
  updateUser      // Mettre à jour l'utilisateur
} = authSlice.actions;


// SELECTORS (pour lire l'état dans les composants)
export const selectJwtToken = (state: { auth: ExtendedAuthState }) => state.auth.jwtToken;
export const selectUser = (state: { auth: ExtendedAuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: ExtendedAuthState }) => state.auth.isAuthenticated;
export const selectAuthIsLoading = (state: { auth: ExtendedAuthState }) => state.auth.isLoading;
export const selectUserRoles = (state: { auth: ExtendedAuthState }) => state.auth.user?.roles || [];
export const selectAuthError = (state: { auth: ExtendedAuthState }) => state.auth.error;

// EXPORT PAR DÉFAUT (le reducer pour le store Redux)
export default authSlice.reducer;