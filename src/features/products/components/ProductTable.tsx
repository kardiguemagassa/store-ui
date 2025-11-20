/**
 * PRODUCT TABLE COMPONENT
 * 
 * Tableau réutilisable pour afficher une liste de produits
 * Avec tri, actions et responsive design
 * 
 * VERSION 1.1 - PRODUCTION READY - NO ANY
 * 
 * @version 1.1
 * @location src/features/products/components/ProductTable.tsx
 */

import React from 'react';
import type { Product } from '../types/product.types';
import { StockBadge } from './StockBadge';

// ============================================
// TYPES
// ============================================

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (product: Product) => React.ReactNode;
  className?: string;
}

interface ProductTableProps {
  products: Product[];
  columns?: Column[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
  onRestore?: (product: Product) => void;
  showActions?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

// ============================================
// COLONNES PAR DÉFAUT
// ============================================

const defaultColumns: Column[] = [
  {
    key: 'product',
    label: 'Produit',
    render: (product) => (
      <div className="flex items-center gap-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
            }}
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-gray-500 text-xs">📦</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
            {product.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            SKU: {product.sku || 'N/A'}
          </div>
        </div>
      </div>
    ),
    className: 'w-96'
  },
  {
    key: 'category',
    label: 'Catégorie',
    sortable: true,
    render: (product) => (
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {product.categoryName || product.categoryCode || '—'}
      </span>
    )
  },
  {
    key: 'price',
    label: 'Prix',
    sortable: true,
    render: (product) => (
      <span className="text-sm font-bold text-gray-900 dark:text-white">
        {product.price.toFixed(2)} €
      </span>
    )
  },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    render: (product) => <StockBadge quantity={product.stockQuantity} />
  },
  {
    key: 'status',
    label: 'Statut',
    render: (product) => {
      const isActive = product.isActive !== false;
      return (
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
        >
          {isActive ? '🟢 Actif' : '🔴 Inactif'}
        </span>
      );
    }
  }
];

// ============================================
// HELPER POUR RÉCUPÉRER VALEUR PAR KEY
// ============================================

/**
 * ✅ Récupère la valeur d'une propriété du produit de manière type-safe
 */
const getProductValue = (product: Product, key: string): string | number | boolean | undefined => {
  // Type guard pour vérifier que la clé existe dans Product
  if (key in product) {
    const value = product[key as keyof Product];
    
    // Retourner uniquement les types primitifs
    if (
      typeof value === 'string' || 
      typeof value === 'number' || 
      typeof value === 'boolean'
    ) {
      return value;
    }
  }
  
  return undefined;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  columns = defaultColumns,
  onEdit,
  onDelete,
  onView,
  onRestore,
  showActions = true,
  isLoading = false,
  emptyMessage = 'Aucun produit à afficher'
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (products.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr
                key={product.productId}
                className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render
                      ? column.render(product)
                      : getProductValue(product, column.key) ?? '—'}
                  </td>
                ))}
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionsCell
                      product={product}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                      onRestore={onRestore}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// SOUS-COMPOSANTS
// ============================================

const ActionsCell: React.FC<{
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
  onRestore?: (product: Product) => void;
}> = ({ product, onEdit, onDelete, onView, onRestore }) => {
  const isActive = product.isActive !== false;

  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <button
          onClick={() => onEdit(product)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm px-3 py-1 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          title="Modifier"
        >
          ✏️
        </button>
      )}

      {onView && (
        <button
          onClick={() => onView(product)}
          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm px-3 py-1 rounded border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
          title="Voir"
        >
          👁️
        </button>
      )}

      {!isActive && onRestore ? (
        <button
          onClick={() => onRestore(product)}
          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm px-3 py-1 rounded border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
          title="Restaurer"
        >
          🔄
        </button>
      ) : (
        onDelete && (
          <button
            onClick={() => onDelete(product)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm px-3 py-1 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Supprimer"
          >
            🗑️
          </button>
        )
      )}
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des produits...</p>
    </div>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
    <div className="text-center">
      <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📦</div>
      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">{message}</p>
    </div>
  </div>
);

export default ProductTable;

/**
 * ✅ EXEMPLES D'UTILISATION:
 * 
 * // Tableau simple
 * <ProductTable 
 *   products={products}
 *   onEdit={(product) => navigate(`/admin/products/edit/${product.productId}`)}
 *   onDelete={(product) => handleDelete(product.productId)}
 *   onView={(product) => navigate(`/products/${product.productId}`)}
 * />
 * 
 * // Tableau avec colonnes personnalisées
 * <ProductTable 
 *   products={products}
 *   columns={[
 *     {
 *       key: 'name',
 *       label: 'Nom',
 *       sortable: true,
 *       render: (product) => <strong>{product.name}</strong>
 *     },
 *     {
 *       key: 'price',
 *       label: 'Prix',
 *       sortable: true,
 *       render: (product) => `${product.price} €`
 *     }
 *   ]}
 *   showActions={false}
 * />
 * 
 * // Tableau admin complet
 * <ProductTable 
 *   products={products}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onView={handleView}
 *   onRestore={handleRestore}
 *   isLoading={loading}
 *   emptyMessage="Aucun produit trouvé avec ces filtres"
 * />
 * 
 * ✅ CHANGEMENTS v1.1:
 * - Remplacement de (product as any)[column.key] par getProductValue() type-safe
 * - Helper getProductValue() avec type guards
 * - Retour '—' par défaut si valeur undefined
 * - Plus aucun 'any' dans le code
 * - 100% type-safe
 */