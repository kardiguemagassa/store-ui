import apiClient from "../api/apiClient";
import type { ApiError, RegisterActionResponse, ActionDataErrors } from "../types/register";

// FONCTION UTILITAIRE réutilisable dans tout le projet
export function getErrorMessage(error: ApiError): string {
  // Priorité 1: Message d'erreur de l'API
  if (typeof error.response?.data?.errorMessage === 'string') {
    return error.response.data.errorMessage;
  }
  
  // Priorité 2: Message d'erreur standard
  if (typeof error.message === 'string') {
    return error.message;
  }
  
  // Priorité 3: Message par défaut selon le statut
  if (error.response?.status === 500) {
    return "Internal server error. Please try again later.";
  }
  
  if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  }
  
  // Fallback générique
  return "An unexpected error occurred. Please try again.";
}

// 🎯 ACTION D'INSCRIPTION
export async function registerAction({ request }: { request: Request }): Promise<RegisterActionResponse> {
  const data = await request.formData();
  const registerData = {
    name: data.get("name") as string,
    email: data.get("email") as string,
    mobileNumber: data.get("mobileNumber") as string,
    password: data.get("password") as string,
  };
  
  try {
    await apiClient.post("/auth/register", registerData);
    return { success: true };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    
    // Erreurs de validation (400)
    if (apiError.response?.status === 400) {
      return { 
        success: false, 
        errors: apiError.response?.data as ActionDataErrors 
      };
    }
    
    // Autres erreurs
    throw new Response(
      getErrorMessage(apiError),
      { 
        status: apiError.response?.status || apiError.status || 500
      }
    );
  }
}