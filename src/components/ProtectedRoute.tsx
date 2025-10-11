import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {

  // Récupère l'état d'authentification de l'utilisateur
  const { isAuthenticated } = useAuth();
  
  // Récupère l'URL actuelle (ex: "/profile", "/orders")
  const location = useLocation();

  // EFFET POUR LA GESTION DES REDIRECTIONS
  useEffect(() => {
    // (utile quand on vient de se connecter et qu'on veut aller directement à la page demandée)
    const skipRedirect = sessionStorage.getItem("skipRedirectPath") === "true";
    
    const shouldSaveRedirect = !isAuthenticated && // Utilisateur NON connecté
                              location.pathname !== "/login" && // Pas déjà sur la page login
                              !skipRedirect; // Pas d'instruction pour sauter la redirection
    
    // SAUVEGARDER LA PAGE DEMANDÉE POUR REDIRIGER APRÈS LOGIN
    if (shouldSaveRedirect) {
      sessionStorage.setItem("redirectPath", location.pathname);
      // L'utilisateur va sur "/profile" sans être connecté,
      // sauvegarde "/profile" pour l'y rediriger après sa connexion
    }
    
    // NETTOYAGE : EFFACER LE FLAG "SAUTER REDIRECTION" APRÈS UTILISATION
    if (skipRedirect) {
      sessionStorage.removeItem("skipRedirectPath");
    }
  }, [isAuthenticated, location.pathname]); //Se déclenche quand l'authentification ou l'URL change

  // CAS SPÉCIAL : ÉVITER LES BOUCLES DE REDIRECTION
  // Si l'utilisateur n'est PAS connecté mais est déjà sur la page login
  // On le laisse accéder à la page login (sinon boucle infinie)
  if (!isAuthenticated && location.pathname === "/login") {
    return <Outlet />; // Autoriser l'accès à la page login
  }

  // LOGIQUE PRINCIPALE DE PROTECTION
  return isAuthenticated 
    ? <Outlet /> // Utilisateur connecté : afficher la page demandée
    : <Navigate to="/login" replace />; // Utilisateur non connecté : rediriger vers login
}