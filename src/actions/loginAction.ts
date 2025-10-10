import type { ActionFunctionArgs } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { LoginResponse, LoginCredentials } from "../types/auth";
import { getErrorMessage } from "../types/errors";


interface AxiosErrorWithResponse extends Error {
  response?: {
    status: number;
    data?: unknown;
  };
}

// Type guard pour vérifier si c'est une erreur Axios avec response
function isAxiosErrorWithResponse(error: unknown): error is AxiosErrorWithResponse {
  return error instanceof Error && 'response' in error;
}

export async function loginAction({ request }: ActionFunctionArgs): Promise<LoginResponse> {
  const data = await request.formData();

  const loginData: LoginCredentials = {
    username: data.get("username") as string,
    password: data.get("password") as string,
  };

  try {
    const response = await apiClient.post("/auth/login", loginData);
    const { message, user, jwtToken } = response.data;
    return { success: true, message, user, jwtToken };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    
    if (isAxiosErrorWithResponse(error)) {
      if (error.response?.status === 401) {
        return {
          success: false,
          errors: { message: "Identifiants incorrects" },
        };
      }
      throw new Response(errorMessage, { 
        status: error.response?.status || 500 
      });
    }
    
    throw new Response(errorMessage, { status: 500 });
  }
}