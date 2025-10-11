import apiClient from "../api/apiClient";
import type { Contacts } from "../types/contact";
import { handleError, type ApiError } from "../types/errors";

export async function contactsLoader(): Promise<Contacts[]> {
  try {
    const response = await apiClient.get<Contacts[]>("/contacts");
    console.log("📥 Contacts chargés:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error(" Erreur lors du chargement:", error);
    
    
    if ((error as ApiError)?.response?.status === 404) {
      return [];
    }
    
    // TOUTES LES AUTRES ERREURS : système centralisé
    const errorMessage = handleError(error);
    const status = (error as ApiError)?.response?.status || 500;
    
    throw new Response(errorMessage, { status });
  }
}