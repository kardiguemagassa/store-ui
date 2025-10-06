import apiClient from "../api/apiClient";
import type { ApiError } from "../types/register";

interface ProfileResponse {
  userId?: number;
  name: string;
  email: string;
  mobileNumber: string;
  roles?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export async function profileLoader() {
  try {
    const response = await apiClient.get<ProfileResponse>("/profile");
    const profileData = response.data;
    
    // ✅ Assurez-vous que l'adresse existe
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
    const apiError = error as ApiError;
    throw new Response(
      apiError.response?.data?.errorMessage ||
        apiError.message ||
        "Failed to fetch profile details. Please try again.",
      { status: apiError.response?.status || apiError.status || 500 }
    );
  }
}