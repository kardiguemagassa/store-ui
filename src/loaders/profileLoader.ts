import apiClient from "../api/apiClient";
import { getErrorMessage, type ApiError } from "../types/errors";
import type { ProfileResponse } from "../types/profile";


export async function profileLoader() {
  try {
    const response = await apiClient.get<ProfileResponse>("/profile");
    const profileData = response.data;
    
    if (!profileData) {
      throw new Error("Aucune donnée de profil reçue");
    }
    
    if (!profileData.address) {
      profileData.address = {
        street: "",
        city: "", 
        state: "",
        postalCode: "",
        country: ""
      };
    }
    
    return profileData;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    const apiError = error as ApiError;
    
    throw new Response(errorMessage, { 
      status: apiError.response?.status || apiError.status || 500 
    });
  }
}