
import { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Sauvegarder l'URL demandée pour rediriger après login
    if (!isAuthenticated && location.pathname !== "/login") {
      sessionStorage.setItem("redirectPath", location.pathname);
    }
  }, [isAuthenticated, location.pathname]);

  // Si authentifié : afficher le contenu (Outlet)
  // Sinon : rediriger vers /login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}