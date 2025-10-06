import type { ActionFunctionArgs } from "react-router-dom";
import { AxiosError } from "axios";
import apiClient from "../api/apiClient";
import type { LoginResponse, LoginCredentials } from "../types/auth";

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
  } catch (error) {
    // Type guard pour vérifier si c'est une erreur Axios
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        return {
          success: false,
          errors: { message: "Invalid username or password" },
        };
      }
      throw new Response(
        error.response?.data?.message ||
          error.message ||
          "Failed to login. Please try again.",
        { status: error.response?.status || 500 }
      );
    }
    
    // Erreur générique
    throw new Response("An unexpected error occurred.", { status: 500 });
  }
}