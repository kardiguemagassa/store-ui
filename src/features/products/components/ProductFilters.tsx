/**
 * PRODUCT FILTER COMPONENT
 * 
 * Composant réutilisable de filtres pour rechercher et trier des produits
 * 
 * VERSION 1.0 - PRODUCTION READY
 * 
 * @version 1.0
 * @location src/features/products/components/ProductFilter.tsx
 */

import React, { useState } from 'react';
import type { Category, AdminSortBy, AdminSortDirection } from '../types/product.types';

// ============================================
// TYPES
// ============================================

export interface ProductFilterState {
  query?: string;
  category?: string;
  sortBy: AdminSortBy;
  sortDirection: AdminSortDirection;
  activeOnly: boolean;
}

interface ProductFilterProps {
  categories: Category[];
  filters: ProductFilterState;
  onFilterChange: (filters: Partial<ProductFilterState>) => void;
  onReset: () => void;
  showActiveFilter?: boolean;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
  showActiveFilter = true
}) => {
  const [localQuery, setLocalQuery] = useState(filters.query || '');

  // Détecter si des filtres sont actifs
  const hasActiveFilters = filters.query || filters.category;

  const handleQueryChange = (value: string) => {
    setLocalQuery(value);
    // Debounce optionnel ici
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ query: localQuery });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Recherche */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔍 Rechercher
          </label>
          <form onSubmit={handleQuerySubmit}>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Nom du produit..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </form>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📁 Catégorie
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔄 Trier par
          </label>
          <select
            value={`${filters.sortBy},${filters.sortDirection}`}
            onChange={(e) => {
              const [sortBy, sortDirection] = e.target.value.split(',') as [
                AdminSortBy,
                AdminSortDirection
              ];
              onFilterChange({ sortBy, sortDirection });
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="NAME,ASC">Nom (A-Z)</option>
            <option value="NAME,DESC">Nom (Z-A)</option>
            <option value="PRICE,ASC">Prix (Croissant)</option>
            <option value="PRICE,DESC">Prix (Décroissant)</option>
            <option value="CREATED_DATE,DESC">Nouveautés</option>
            <option value="POPULARITY,DESC">Popularité</option>
            <option value="STOCK_QUANTITY,ASC">Stock (Croissant)</option>
            <option value="STOCK_QUANTITY,DESC">Stock (Décroissant)</option>
          </select>
        </div>
      </div>

      {/* Filtres supplémentaires */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        
        {/* Filtre actif/inactif */}
        {showActiveFilter && (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.activeOnly}
              onChange={(e) => onFilterChange({ activeOnly: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Produits actifs uniquement
            </span>
          </label>
        )}

        {/* Bouton réinitialiser */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
          >
            <span>↺</span>
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * ✅ Variantes du composant
 */

// Filtre simple (public)
export const SimpleProductFilter: React.FC<{
  categories: Category[];
  query?: string;
  category?: string;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
}> = ({ categories, query, category, onQueryChange, onCategoryChange }) => (
  <div className="flex flex-col sm:flex-row gap-4 mb-6">
    <div className="flex-1">
      <input
        type="text"
        value={query || ''}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Rechercher un produit..."
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
      />
    </div>
    <select
      value={category || ''}
      onChange={(e) => onCategoryChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
    >
      <option value="">Toutes les catégories</option>
      {categories.map((cat) => (
        <option key={cat.categoryId} value={cat.code}>
          {cat.name}
        </option>
      ))}
    </select>
  </div>
);

export default ProductFilter;

/**
 * ✅ EXEMPLE D'UTILISATION:
 * 
 * const [filters, setFilters] = useState<ProductFilterState>({
 *   sortBy: 'NAME',
 *   sortDirection: 'ASC',
 *   activeOnly: false
 * });
 * 
 * const handleFilterChange = (updates: Partial<ProductFilterState>) => {
 *   setFilters(prev => ({ ...prev, ...updates }));
 * };
 * 
 * const handleReset = () => {
 *   setFilters({
 *     sortBy: 'NAME',
 *     sortDirection: 'ASC',
 *     activeOnly: false
 *   });
 * };
 * 
 * <ProductFilter
 *   categories={categories}
 *   filters={filters}
 *   onFilterChange={handleFilterChange}
 *   onReset={handleReset}
 *   showActiveFilter={true}
 * />
 */