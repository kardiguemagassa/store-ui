import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logger } from "../../../shared/types/errors.types";

/**
 * PROTECTED ROUTE COMPONENT - VERSION 4.0
 * 
 * Compatible avec Backend Sécurisé V4:
 * - Vérifie l'authentification via Redux
 * - Gère les redirections après login
 * - Compatible avec le refresh automatique des tokens
 * - Pas de vérification manuelle du refresh token (géré par apiClient)
 * 
 * SÉCURITÉ V4:
 * - JWT vérifié automatiquement par apiClient
 * - Refresh token en cookie HttpOnly
 * - Refresh automatique transparent si JWT expiré
 * 
 * @version 4.0 (Backend Security Enhanced)
 */

export default function ProtectedRoute() {
  // Récupère l'état d'authentification depuis Redux
  const { isAuthenticated } = useAuth();
  
  // Récupère l'URL actuelle (ex: "/profile", "/orders")
  const location = useLocation();

  // EFFET POUR LA GESTION DES REDIRECTIONS
  useEffect(() => {
    // Vérifier s'il faut sauter la redirection
    // (utile quand on vient de se connecter et qu'on veut aller directement à la page demandée)
    const skipRedirect = sessionStorage.getItem("skipRedirectPath") === "true";
    
    const shouldSaveRedirect = !isAuthenticated &&                    // Utilisateur NON connecté
                              location.pathname !== "/login" &&        // Pas déjà sur la page login
                              location.pathname !== "/register" &&     // Pas sur la page register
                              !skipRedirect;                           // Pas d'instruction pour sauter
    
    // SAUVEGARDER LA PAGE DEMANDÉE POUR REDIRIGER APRÈS LOGIN
    if (shouldSaveRedirect) {
      sessionStorage.setItem("redirectPath", location.pathname);
      logger.info('Chemin de redirection sauvegardé', 'ProtectedRoute', {
        path: location.pathname
      });
    }
    
    // NETTOYAGE : EFFACER LE FLAG "SAUTER REDIRECTION" APRÈS UTILISATION
    if (skipRedirect) {
      sessionStorage.removeItem("skipRedirectPath");
    }
  }, [isAuthenticated, location.pathname]); // Se déclenche quand l'authentification ou l'URL change

  // ============================================
  // CAS SPÉCIAL : PAGES PUBLIQUES
  // ============================================
  // Si l'utilisateur n'est PAS connecté mais est sur une page publique (login, register)
  // On le laisse accéder (sinon boucle infinie de redirection)
  const publicPaths = ["/login", "/register"];
  if (!isAuthenticated && publicPaths.includes(location.pathname)) {
    return <Outlet />; // Autoriser l'accès aux pages publiques
  }

  // ============================================
  // LOGIQUE PRINCIPALE DE PROTECTION
  // ============================================
  
  /**
   * V4: COMMENT ÇA FONCTIONNE
   * 
   * 1. Utilisateur connecté (isAuthenticated = true):
   *    → Affiche la page demandée (<Outlet />)
   * 
   * 2. Utilisateur non connecté (isAuthenticated = false):
   *    → Redirige vers /login
   *    → La page demandée est sauvegardée dans sessionStorage
   *    → Après login, redirection automatique vers la page demandée
   * 
   * 3. JWT expiré pendant la navigation:
   *    → apiClient détecte le 401
   *    → Refresh automatique avec le cookie
   *    → La requête est rejouée avec le nouveau JWT
   *    → L'utilisateur ne voit rien (transparent)
   * 
   * 4. Refresh token expiré:
   *    → apiClient échoue à refresh
   *    → dispatch(logout()) dans apiClient
   *    → isAuthenticated devient false
   *    → Redirection automatique vers /login
   */
  
  if (isAuthenticated) {
    return <Outlet />; // Utilisateur connecté : afficher la page demandée
  } else {
    logger.info('Redirection vers la page de connexion', 'ProtectedRoute', {
      currentPath: location.pathname
    });
    return <Navigate to="/login" replace />; // Utilisateur non connecté : rediriger vers login
  }
}