import apiClient from "../api/apiClient";
import type { Product } from "../types/product";
import { handleError, type ApiError } from "../types/errors";

export async function productsLoader(): Promise<Product[]> {
  try {
    const response = await apiClient.get<Product[]>("/products");
    console.log("Products loaded:", response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("Failed to load products:", error);
    
    const errorMessage = handleError(error);
    const status = (error as ApiError)?.response?.status || 500;
    
    throw new Response(errorMessage, { status });
  }
}