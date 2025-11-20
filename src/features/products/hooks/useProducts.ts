import { useState, useEffect } from 'react';
import productService from '../services/productService';
import { getErrorMessage } from '../../../shared/types/errors.types';
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
        console.log("🔄 [useProducts] Chargement avec filtres:", filters);
        
        const response: PaginatedProductsResponse = await productService.getProducts(filters);
        
        console.log("✅ [useProducts] Réponse reçue:", {
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
        console.error("❌ [useProducts] Erreur:", errorMsg);
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