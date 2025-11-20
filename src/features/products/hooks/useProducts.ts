import { useState, useEffect } from 'react';
import productService from '../services/productService';
import { getErrorMessage, logger } from '../../../shared/types/errors.types';
import type { 
  PublicProductFilters, 
  PaginatedProductsResponse,
  Product 
} from '../types/product.types';

export function useProducts(filters: PublicProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        logger.debug("Chargement produits avec filtres", "useProducts", {
          page: filters.page,
          size: filters.size,
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          hasQuery: !!filters.query,
          hasCategory: !!filters.category
        });
        
        const response: PaginatedProductsResponse = await productService.getProducts(filters);
        
        logger.debug("Produits chargés avec succès", "useProducts", {
          productsCount: response.content?.length || 0,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          currentPage: response.number
        });
        
        setProducts(response.content || []);
        setPagination({
          currentPage: response.number || 0,
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          size: response.size || 12
        });
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        logger.error("Erreur chargement produits", "useProducts", err, {
          page: filters.page,
          hasQuery: !!filters.query,
          hasCategory: !!filters.category
        });
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  return { 
    products, 
    loading, 
    error, 
    pagination 
  };
}