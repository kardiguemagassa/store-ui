import type { LoaderFunctionArgs } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { Product } from "../types/product";
import { handleError } from "../types/errors";

export async function productDetailLoader({ params }: LoaderFunctionArgs): Promise<Product> {
  try {
    const { productId } = params;
    
    if (!productId) {
      throw new Response("Product ID is missing", { status: 400 });
    }
    
    const response = await apiClient.get<Product>(`/products/${productId}`);
    return response.data;
    
  } catch (error: unknown) {
    console.error("Failed to load product:", error);
    
    const errorMessage = handleError(error);
    const status = (error as { response?: { status?: number } })?.response?.status || 500;
    
    throw new Response(errorMessage, { status });
  }
}