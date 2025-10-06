import { isAxiosError } from "axios";
import apiClient from "../api/apiClient";
import type { Contacts } from "../types/contact";

/**
 * Loader : charge la liste des contacts (optionnel)
 * Utilisé si vous voulez afficher les contacts existants
 */
export async function contactsLoader(): Promise<Contacts[]> {
  try {
    const response = await apiClient.get<Contacts[]>("/contacts");
    console.log("📥 Contacts chargés:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("❌ Erreur lors du chargement:", error);
    
    // Vérifier si c'est une erreur Axios
    if (isAxiosError(error)) {
      // Si aucun contact (404), retourner tableau vide
      if (error.response?.status === 404) {
        return [];
      }
      
      // Autre erreur : lancer une Response
      throw new Response("Impossible de charger les contacts", { 
        status: error.response?.status || 500 
      });
    }
    
    // Erreur non-Axios
    throw new Response("Erreur de connexion", { status: 500 });
  }
}