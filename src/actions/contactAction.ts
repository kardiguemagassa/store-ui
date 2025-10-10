// actions/contactAction.ts - VERSION SIMPLE RECOMMANDÉE
import type { ActionFunctionArgs } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { Contacts, ContactActionData } from "../types/contact";
import { 
  handleApiError, 
  extractValidationErrors,
  type ActionDataErrors 
} from "../types/errors";

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

    const response = await apiClient.post<Contacts>("/contacts", contactData);
    console.log(" Succès:", response.data);

    return { success: true };

  } catch (error: unknown) {
    console.error(" Erreur:", error);

    //SYSTÈME D'ERREURS CENTRALISÉ
    const errorInfo = handleApiError(error);
    const validationErrors = extractValidationErrors(error);

    return {
      success: false,
      error: errorInfo.message,
      validationErrors: validationErrors as ActionDataErrors | undefined
    };
  }
}