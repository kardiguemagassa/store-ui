import apiClient from "../api/apiClient";
import type { OrderResponse } from "../types/orders";
import { handleError } from "../types/errors";

export async function adminOrdersLoader() {
  try {
    const response = await apiClient.get<OrderResponse[]>("/admin/orders");
    return response.data;
  } catch (error: unknown) {
    console.error("Admin orders loader error:", error);
    
    const errorMessage = handleError(error);
    
    // ✅ Récupération du statut HTTP sans any
    let status = 500;
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      status = axiosError.response?.status || 500;
    }
    
    throw new Response(errorMessage, { status });
  }
}