import { useAppDispatch, useAppSelector } from './redux';
import { logoutAsync } from '../store/authSlice';
import type { User } from '../types/auth.types';

/**
 * USEAUTH HOOK - VERSION 4.0
 * 
 * Hook personnalisé pour l'authentification avec Redux.
 * Compatible avec Backend Sécurisé V4.
 * 
 * CHANGEMENTS V4:
 * - Import User depuis auth.types.ts
 * - Pas de selecteurs complexes (accès direct au state)
 * - Gestion des champs optionnels (username?, email?, name?)
 * - logoutAsync au lieu de logout synchrone
 * 
 * @version 4.0 (Backend Security Enhanced)
 */

export function useAuth() {
  const dispatch = useAppDispatch();
  
  // SÉLECTEURS REDUX
  /**
   * V4: Accès direct au state auth
   * Plus simple que des sélecteurs séparés
   */
  const jwtToken = useAppSelector((state) => state.auth.jwtToken);
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  
  // DÉRIVATIONS
  /**
   * V4: Extraction des rôles avec gestion null-safe
   */
  const roles = user?.roles ?? [];
  
  /**
   * V4: Vérification admin
   */
  const isAdmin = roles.includes("ROLE_ADMIN");

  // ============================================
  // ACTIONS
  // ============================================
  
  /**
   * V4: Déconnexion asynchrone
   * Appelle le backend pour révoquer le refresh token
   */
  const logout = () => {
    dispatch(logoutAsync());
  };

  /**
   * V4: Mise à jour utilisateur (optionnel)
   * Note: À implémenter dans authSlice si nécessaire
   */
  const updateUser = (userData: Partial<User>) => {
    // TODO: Implémenter updateUser dans authSlice si besoin
    console.warn('updateUser not implemented yet', userData);
  };

  // ============================================
  // RETURN
  // ============================================
  
  return {
    // État
    jwtToken,
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Dérivations
    roles,
    isAdmin,
    
    // Actions
    logout,
    updateUser,
  };
}

/**
 * EXEMPLE D'UTILISATION:
 * 
 * const { isAuthenticated, user, logout, isAdmin } = useAuth();
 * 
 * if (isAuthenticated) {
 *   console.log('User:', user?.username);
 *   console.log('Is admin:', isAdmin);
 * }
 * 
 * // Déconnexion
 * const handleLogout = () => {
 *   logout();
 * };
 */