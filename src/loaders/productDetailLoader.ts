import type { LoaderFunctionArgs } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { Product } from "../types/product";

// Loader pour UN produit spécifique
// Appelé AVANT le rendu de ProductDetail
// params contient l'ID extrait de l'URL (/products/:productId)
export async function productDetailLoader({ params }: LoaderFunctionArgs): Promise<Product> {
  try {
    const { productId } = params;
    
    // 🛡️ Validation : l'ID doit exister dans l'URL
    if (!productId) {
      throw new Response("Product ID is missing", { status: 400 });
    }
    
    // 📡 Requête GET vers l'API backend pour UN produit
    // URL complète : http://localhost:8080/api/v1/products/123
    const response = await apiClient.get<Product>(`/products/${productId}`);
    
    console.log("Product loaded:", response.data);
    
    // Retourne UN seul produit (pas un tableau)
    return response.data;
    
  } catch (error: unknown) {
    console.error("Failed to load product:", error);
    
    let errorMessage = "Failed to fetch product details. Please try again.";
    let errorStatus = 500;
    
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      
      errorMessage = axiosError.message || errorMessage;
      errorStatus = axiosError.response?.status || errorStatus;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    throw new Response(errorMessage, { status: errorStatus });
  }
}