import apiClient from '../../../shared/api/apiClient';
import { logger } from '../../../shared/types/errors.types';
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
  
  // l'endpoint de recherche public
  const params: Record<string, string> = {
    page: (criteria.page ?? DEFAULT_PAGE).toString(),
    size: (criteria.size ?? DEFAULT_SIZE).toString(),
    sortBy: criteria.sortBy || DEFAULT_SORT_BY,
    sortDirection: criteria.sortDirection || DEFAULT_SORT_DIRECTION,
    activeOnly: 'true', // Toujours true pour le front public
    inStockOnly: criteria.inStockOnly ? 'true' : 'false'
  };

  // Paramètres optionnels
  if (criteria.searchQuery) params.query = criteria.searchQuery;
  if (criteria.categoryCode) params.category = criteria.categoryCode;
  if (criteria.minPrice !== undefined) params.minPrice = criteria.minPrice.toString();
  if (criteria.maxPrice !== undefined) params.maxPrice = criteria.maxPrice.toString();

  logger.debug("Requête recherche produits", "ProductService", {
    endpoint: '/products/search',
    hasQuery: !!criteria.searchQuery,
    hasCategory: !!criteria.categoryCode,
    page: criteria.page,
    size: criteria.size,
    sortBy: criteria.sortBy,
    sortDirection: criteria.sortDirection
  });

  try {
    const response = await apiClient.get<PaginatedProductsResponse>('/products/search', { params });

    logger.debug("Réponse recherche produits", "ProductService", {
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      currentPage: response.data.number,
      contentLength: response.data.content?.length || 0
    });

    return response.data;

  } catch (error) {
    logger.error("Erreur recherche produits", "ProductService", error, {
      hasQuery: !!criteria.searchQuery,
      hasCategory: !!criteria.categoryCode,
      page: criteria.page
    });
    
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
  
  logger.debug("Récupération produits", "ProductService", {
    page: filters.page,
    size: filters.size,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    hasQuery: !!filters.query,
    hasCategory: !!filters.category
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
    
    logger.debug("Produits populaires récupérés", "ProductService", {
      limit,
      count: response.data.content?.length || 0
    });
    
    return response.data.content;
  } catch (error) {
    logger.error("Erreur produits populaires", "ProductService", error, { limit });
    return [];
  }
}

export async function getNewProducts(limit: number = 8): Promise<Product[]> {
  try {
    // tri par date de création
    const criteria: ProductSearchCriteria = {
      activeOnly: true,
      sortBy: "CREATED_DATE",
      sortDirection: "DESC",
      page: 0,
      size: limit
    };
    
    const response = await advancedProductSearch(criteria);
    
    logger.debug("Nouveaux produits récupérés", "ProductService", {
      limit,
      count: response.content?.length || 0
    });
    
    return response.content;
  } catch (error) {
    logger.error("Erreur nouveaux produits", "ProductService", error, { limit });
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
    
    logger.debug("Produits par catégorie récupérés", "ProductService", {
      categoryCode,
      limit,
      count: response.data.content?.length || 0
    });
    
    return response.data.content;
  } catch (error) {
    logger.error("Erreur produits par catégorie", "ProductService", error, {
      categoryCode,
      limit
    });
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
    
    logger.debug("Produit récupéré par ID", "ProductService", {
      productId,
      hasProduct: !!response.data
    });
    
    return response.data;
  } catch (error) {
    logger.error("Erreur produit par ID", "ProductService", error, { productId });
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
    
    logger.debug("Catégories récupérées", "ProductService", {
      count: response.data.length
    });
    
    return response.data;
  } catch (error) {
    logger.error("Erreur récupération catégories", "ProductService", error);
    return [];
  }
}

export async function getCategoryByCode(
  categoryCode: string, 
  signal?: AbortSignal
): Promise<Category | null> {
  const categories = await getCategories(signal);
  const category = categories.find(cat => cat.code === categoryCode) || null;
  
  logger.debug("Recherche catégorie par code", "ProductService", {
    categoryCode,
    found: !!category
  });
  
  return category;
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