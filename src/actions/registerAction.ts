import apiClient from "../api/apiClient";
import { handleApiError } from "../types/errors";
import type { RegisterActionResponse } from "../types/register";
import { AxiosError } from 'axios';

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
    const errorInfo = handleApiError(error); // BUSINESS: Messages utilisateur
    
    if (errorInfo.errors) {
      return { 
        success: false, 
        errors: errorInfo.errors // Erreurs de validation formatées
      };
    }
    
    const statusCode = error instanceof AxiosError ? error.response?.status || 500 : 500; // TECHNIQUE: Status HTTP
    
    throw new Response(errorInfo.message, { status: statusCode });
  }
}