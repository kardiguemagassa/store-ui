// src/hooks/useCategories.ts
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../shared/api/apiClient';
import type { Category } from '../types/product.types';
import { toast } from "react-toastify";
import { getErrorMessage } from '../../../shared/types/errors.types';


export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Chargement des catégories...");
      
      // ✅CORRECTION : Typage correct pour ApiResponse
      const response = await apiClient.get<{success: boolean;message?: string;data: Category[];}>("/categories");
      
      // ✅ Déballer la réponse (gérer les 2 formats)
      const categoriesData = response.data.data || response.data;
      
      // ✅ VALIDATION ROBUSTE
      if (Array.isArray(categoriesData)) {
        console.log("✅ Catégories chargées:", categoriesData.length, "catégories");
        setCategories(categoriesData);
      } else {
        console.warn("⚠️ Format de réponse invalide:", response.data);
        setCategories([]);
      }
      
    } catch (error: unknown) {
      console.error("❌ Erreur chargement catégories:", error);
      const errorMessage = getErrorMessage(error);
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