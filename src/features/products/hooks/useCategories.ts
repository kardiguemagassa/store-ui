import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../shared/api/apiClient';
import type { Category } from '../types/product.types';
import { toast } from "react-toastify";
import { getErrorMessage, logger } from '../../../shared/types/errors.types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug("Chargement des catégories...", "useCategories");
      
      const response = await apiClient.get<{success: boolean;message?: string;data: Category[];}>("/categories");
      
      const categoriesData = response.data.data || response.data;
      
      if (Array.isArray(categoriesData)) {
        logger.debug("Catégories chargées avec succès", "useCategories", { 
          categoriesCount: categoriesData.length 
        });
        setCategories(categoriesData);
      } else {
        logger.warn("Format de réponse invalide", "useCategories", { 
          responseData: response.data 
        });
        setCategories([]);
      }
      
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logger.error("Erreur lors du chargement des catégories", "useCategories", error);
      setError(errorMessage);
      toast.error(`Erreur catégories: ${errorMessage}`);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { 
    categories, 
    loading, 
    error,
    refetch: loadCategories
  };
};