// actions/contactAction.ts
import type { ActionFunctionArgs } from "react-router-dom";
import { AxiosError } from "axios";
import apiClient from "../api/apiClient";
import type { Contacts, ContactActionData } from "../types/contact";

/**
 * Interface : structure de la réponse d'erreur du backend Spring Boot
 * Votre backend retourne directement les erreurs sans les wrapper
 */
interface BackendErrorResponse {
  // Soit un objet avec les erreurs de validation directement
  name?: string;
  email?: string;
  mobileNumber?: string;
  message?: string;
  // Soit un message d'erreur générique
  error?: string;
  status?: number;
}

/**
 * Action : soumission du formulaire de contact
 */
export async function contactAction({
  request,
}: ActionFunctionArgs): Promise<ContactActionData> {
  try {
    const formData = await request.formData();

    const contactData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      mobileNumber: formData.get("mobileNumber") as string,
      message: formData.get("message") as string,
    };

    console.log("📤 Envoi des données:", contactData);

    const response = await apiClient.post<Contacts>("/contacts", contactData);

    console.log("✅ Succès:", response.data);

    return { success: true };

  } catch (error: unknown) {
    console.error("❌ Erreur:", error);

    if (isAxiosError(error)) {
      return handleAxiosError(error);
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Une erreur inattendue s'est produite",
    };
  }
}

/**
 * Type guard : vérifie si c'est une erreur Axios
 */
function isAxiosError(error: unknown): error is AxiosError<BackendErrorResponse> {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Gère les erreurs Axios
 */
function handleAxiosError(
  error: AxiosError<BackendErrorResponse>
): ContactActionData {
  
  if (error.response?.status === 400) {
    const errorData = error.response.data;

    console.log("🔍 Réponse backend 400:", errorData);

    // Votre backend retourne directement les erreurs de validation
    // Vérifier si errorData contient des clés de champs
    if (errorData && (errorData.name || errorData.email || errorData.mobileNumber || errorData.message)) {
      return {
        success: false,
        error: "Veuillez corriger les erreurs de validation",
        validationErrors: {
          name: errorData.name,
          email: errorData.email,
          mobileNumber: errorData.mobileNumber,
          message: errorData.message,
        },
      };
    }

    return {
      success: false,
      error: "Données invalides",
    };
  }

  if (error.response?.status === 500) {
    return {
      success: false,
      error: "Erreur serveur. Veuillez réessayer plus tard.",
    };
  }

  if (!error.response) {
    return {
      success: false,
      error: "Impossible de contacter le serveur. Vérifiez votre connexion.",
    };
  }

  return {
    success: false,
    error: `Erreur ${error.response.status}`,
  };
}