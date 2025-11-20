// hooks/useAdminProducts.ts
import { useState, useEffect } from "react";
import type { Product, AdminProductFilters, PaginatedProductsResponse } from "../types/product.types";
import apiClient from "../../../shared/api/apiClient";
import { logger } from "../../../shared/types/errors.types";

interface UseAdminProductsResult {
  products: Product[];
  loading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
  };
  refetch: () => void;
}

export const useAdminProducts = (filters: AdminProductFilters): UseAdminProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      logger.debug("Chargement produits admin avec paramètres", "useAdminProducts", { filters });

      const cleanParams: Record<string, string> = {};

      // Paramètres obligatoires
      cleanParams.page = filters.page.toString();
      cleanParams.size = filters.size.toString();
      cleanParams.sortBy = filters.sortBy;
      cleanParams.sortDirection = filters.sortDirection;

     
      if (filters.activeOnly !== null && filters.activeOnly !== undefined) {
        cleanParams.activeOnly = filters.activeOnly.toString();
      }
      // Si activeOnly est null, NE PAS inclure le paramètre du tout

      // Filtres optionnels
      if (filters.query) {
        cleanParams.query = filters.query;
      }
      if (filters.category) {
        cleanParams.category = filters.category;
      }

      logger.debug("Appel endpoint admin avec paramètres", "useAdminProducts", {
        endpoint: "/products/admin/paginated",
        params: cleanParams
      });

      const response = await apiClient.get<PaginatedProductsResponse>(
        "/products/admin/paginated",
        { params: cleanParams }
      );

      const data = response.data;
      
      logger.debug("Produits admin chargés avec succès", "useAdminProducts", {
        count: data.content?.length || 0,
        total: data.totalElements,
        page: data.number,
        totalPages: data.totalPages,
        activeOnlyFilter: filters.activeOnly
      });

      setProducts(data.content || []);
      setPagination({
        currentPage: data.number || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        size: data.size || 10
      });

    } catch (error: unknown) {
      logger.error("Erreur lors du chargement des produits admin", "useAdminProducts", error, { filters });
      
      // Fallback vers l'endpoint public
      logger.debug("Tentative avec endpoint public comme fallback", "useAdminProducts", { filters });
      
      try {
        const fallbackParams: Record<string, string> = {
          page: filters.page.toString(),
          size: filters.size.toString(),
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
        };

        // Appliquer la même logique pour le fallback
        if (filters.activeOnly !== null && filters.activeOnly !== undefined) {
          fallbackParams.activeOnly = filters.activeOnly.toString();
        }

        if (filters.query) fallbackParams.query = filters.query;
        if (filters.category) fallbackParams.category = filters.category;

        const fallbackResponse = await apiClient.get<PaginatedProductsResponse>(
          "/products/search",
          { params: fallbackParams }
        );

        const fallbackData = fallbackResponse.data;
        
        logger.debug("Fallback réussi avec endpoint public", "useAdminProducts", {
          count: fallbackData.content?.length || 0,
          total: fallbackData.totalElements
        });

        setProducts(fallbackData.content || []);
        setPagination({
          currentPage: fallbackData.number || 0,
          totalPages: fallbackData.totalPages || 0,
          totalElements: fallbackData.totalElements || 0,
          size: fallbackData.size || 10
        });

      } catch (fallbackError) {
        logger.error("Fallback échoué", "useAdminProducts", fallbackError, { filters });
        setProducts([]);
        setPagination({
          currentPage: 0,
          totalPages: 0,
          totalElements: 0,
          size: 10
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.size, filters.sortBy, filters.sortDirection, filters.query, filters.category, filters.activeOnly]);

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    pagination,
    refetch
  };
};