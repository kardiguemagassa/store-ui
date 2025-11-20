/**
 * PRODUCT SERVICE - FRONTEND PUBLIC
 * Aligné avec les endpoints backend publics
 */

import apiClient from '../../../shared/api/apiClient';
import type {
  Product,
  Category,
  PublicProductFilters,
  PaginatedProductsResponse,
  ProductSearchCriteria,
  PublicSortBy,
  PublicSortDirection
} from '../types/product.types';

const DEFAULT_SORT_BY: PublicSortBy = "NAME";
const DEFAULT_SORT_DIRECTION: PublicSortDirection = "ASC";
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 12;

export async function advancedProductSearch(
  criteria: ProductSearchCriteria,
): Promise<PaginatedProductsResponse> {
  
  // ✅ CORRECTION: Utiliser l'endpoint de recherche public
  const params: Record<string, string> = {
    page: (criteria.page ?? DEFAULT_PAGE).toString(),
    size: (criteria.size ?? DEFAULT_SIZE).toString(),
    sortBy: criteria.sortBy || DEFAULT_SORT_BY,
    sortDirection: criteria.sortDirection || DEFAULT_SORT_DIRECTION,
    activeOnly: 'true', // ✅ Toujours true pour le front public
    inStockOnly: criteria.inStockOnly ? 'true' : 'false'
  };

  // Paramètres optionnels
  if (criteria.searchQuery) params.query = criteria.searchQuery;
  if (criteria.categoryCode) params.category = criteria.categoryCode;
  if (criteria.minPrice !== undefined) params.minPrice = criteria.minPrice.toString();
  if (criteria.maxPrice !== undefined) params.maxPrice = criteria.maxPrice.toString();

  console.log("🔍 [ProductService] Requête API publique:", {
    endpoint: '/products/search',
    params
  });

  try {
    const response = await apiClient.get<PaginatedProductsResponse>('/products/search', { params });

    console.log("📥 [ProductService] Réponse paginée publique:", {
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      currentPage: response.data.number,
      contentLength: response.data.content?.length || 0
    });

    return response.data;

  } catch (error) {
    console.error("❌ [ProductService] Erreur API publique:", error);
    
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: criteria.size || DEFAULT_SIZE,
      number: criteria.page || DEFAULT_PAGE,
      first: true,
      last: true,
      empty: true
    };
  }
}

export async function getProducts(
  filters: PublicProductFilters,
): Promise<PaginatedProductsResponse> {
  
  console.log("📦 [ProductService] getProducts public:", {
    page: filters.page,
    size: filters.size,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    query: filters.query
  });

  const searchCriteria: ProductSearchCriteria = {
    searchQuery: filters.query,
    categoryCode: filters.category,
    activeOnly: true,
    inStockOnly: false,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    page: filters.page,
    size: filters.size
  };

  return advancedProductSearch(searchCriteria);
}

// MÉTHODES SPÉCIALISÉES

export async function getPopularProducts(limit: number = 8): Promise<Product[]> {
  try {
    const response = await apiClient.get<PaginatedProductsResponse>(
      `/products/featured?page=0&size=${limit}`
    );
    return response.data.content;
  } catch (error) {
    console.error("❌ [ProductService] Erreur produits populaires:", error);
    return [];
  }
}

export async function getNewProducts(limit: number = 8): Promise<Product[]> {
  try {
    // Utiliser le tri par date de création
    const criteria: ProductSearchCriteria = {
      activeOnly: true,
      sortBy: "CREATED_DATE",
      sortDirection: "DESC",
      page: 0,
      size: limit
    };
    
    const response = await advancedProductSearch(criteria);
    return response.content;
  } catch (error) {
    console.error("❌ [ProductService] Erreur nouveaux produits:", error);
    return [];
  }
}

export async function getProductsByCategory(
  categoryCode: string,
  limit: number = 12,
): Promise<Product[]> {
  try {
    const response = await apiClient.get<PaginatedProductsResponse>(
      `/products/category/${categoryCode}?page=0&size=${limit}`
    );
    return response.data.content;
  } catch (error) {
    console.error("❌ [ProductService] Erreur produits par catégorie:", error);
    return [];
  }
}

export async function getProductById(
  productId: number, 
  signal?: AbortSignal
): Promise<Product> {
  try {
    const response = await apiClient.get<Product>(
      `/products/${productId}`, 
      { signal }
    );
    return response.data;
  } catch (error) {
    console.error("❌ [ProductService] Erreur produit par ID:", error);
    throw error;
  }
}

// CATÉGORIES

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  try {
    const response = await apiClient.get<Category[]>(
      '/categories', 
      { signal }
    );
    return response.data;
  } catch (error) {
    console.error("❌ [ProductService] Erreur catégories:", error);
    return [];
  }
}

export async function getCategoryByCode(
  categoryCode: string, 
  signal?: AbortSignal
): Promise<Category | null> {
  const categories = await getCategories(signal);
  return categories.find(cat => cat.code === categoryCode) || null;
}

// EXPORT PAR DÉFAUT

const productService = {
  // Méthodes principales
  getProducts,
  advancedProductSearch,
  getProductById,
  
  // Catégories
  getCategories,
  getCategoryByCode,
  
  // Méthodes spécialisées
  getPopularProducts,
  getNewProducts,
  getProductsByCategory,
};

export default productService;