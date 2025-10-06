import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const skipRedirect = sessionStorage.getItem("skipRedirectPath") === "true";
    const shouldSaveRedirect = !isAuthenticated && 
                              location.pathname !== "/login" && 
                              !skipRedirect;
    
    if (shouldSaveRedirect) {
      sessionStorage.setItem("redirectPath", location.pathname);
    }
    
    // Nettoyer le skipRedirect après utilisation
    if (skipRedirect) {
      sessionStorage.removeItem("skipRedirectPath");
    }
  }, [isAuthenticated, location.pathname]);

  // Ajout d'un fallback pour éviter les boucles de redirection
  if (!isAuthenticated && location.pathname === "/login") {
    return <Outlet />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}