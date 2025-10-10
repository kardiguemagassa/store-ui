import apiClient from "../api/apiClient";
import { handleApiError, extractValidationErrors, type ActionDataErrors } from "../types/errors";
import type { ProfileData } from "../types/profile";

export async function profileAction({ request }: { request: Request }) {
  const data = await request.formData();

  const profileData = {
    name: (data.get("name") as string) || "",
    email: (data.get("email") as string) || "",
    mobileNumber: (data.get("mobileNumber") as string) || "",
    street: (data.get("street") as string) || "",    
    city: (data.get("city") as string) || "",          
    state: (data.get("state") as string) || "",         
    postalCode: (data.get("postalCode") as string) || "", 
    country: (data.get("country") as string) || "",     
  };

  try {
    const response = await apiClient.put("/profile", profileData);

    // VÉRIFIER SI LA RÉPONSE CONTIENT DES ERREURS
    if (response.data.errors) {
      return { 
        success: false, 
        errors: response.data.errors as ActionDataErrors 
      };
    }
    
    // Restructurer pour correspondre à ProfileData
    const formattedResponse: ProfileData & { emailUpdated?: boolean } = {
      name: response.data.name || "",
      email: response.data.email || "",
      mobileNumber: response.data.mobileNumber || "",
      address: {
        street: response.data.street || response.data.address?.street || "",
        city: response.data.city || response.data.address?.city || "",
        state: response.data.state || response.data.address?.state || "",
        postalCode: response.data.postalCode || response.data.address?.postalCode || "",
        country: response.data.country || response.data.address?.country || ""
      },
      emailUpdated: response.data.emailUpdated || false
    };
    
    return { 
      success: true, 
      profileData: formattedResponse 
    };
    
  } catch (error: unknown) {
    
    // Utiliser la gestion d'erreurs centralisée
    const errorInfo = handleApiError(error);
    const validationErrors = extractValidationErrors(error);

    if (validationErrors) {
      return { 
        success: false, 
        errors: validationErrors 
      };
    }

    // Pour les autres erreurs
    return {
      success: false,
      errors: { general: errorInfo.message }
    };
  }
}