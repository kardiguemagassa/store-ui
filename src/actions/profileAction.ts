import apiClient from "../api/apiClient";
import type { ActionDataErrors, ApiError } from "../types/register";

export async function profileAction({ request }: { request: Request }) {
  const data = await request.formData();

  // CORRECTION : Envoyer les champs d'adresse directement à la racine
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

  console.log("🔄 Données envoyées au backend:", profileData);

  try {
    const response = await apiClient.put("/profile", profileData);
    return { success: true, profileData: response.data };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    
    if (apiError.response?.status === 400) {
      return { success: false, errors: apiError.response?.data as ActionDataErrors };
    }
    
    throw new Response(
      apiError.response?.data?.errorMessage ||
        apiError.message ||
        "Failed to save profile details. Please try again.",
      { status: apiError.response?.status || apiError.status || 500 }
    );
  }
}