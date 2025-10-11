import apiClient from "../api/apiClient";
import type { OrderResponse } from "../types/orders";
import { handleError, type ApiError } from "../types/errors";


export const handleLoaderError = (error: unknown): Response => {
  const errorMessage = handleError(error);
  const status = (error as ApiError)?.response?.status || 500;
  return new Response(errorMessage, { status });
};

export async function adminOrdersLoader() {
  try {
    const response = await apiClient.get<OrderResponse[]>("/admin/orders");
    return response.data;
  } catch (error: unknown) {
    console.error("Admin orders loader error:", error);
    throw handleLoaderError(error);
  }
}