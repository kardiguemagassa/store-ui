import { useCallback, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import type { Product, Category, AdminProductFilters } from "../../types/product.types";
import { toast } from "react-toastify";
import Pagination from "../../../../shared/components/Pagination";
import apiClient from "../../../../shared/api/apiClient";
import { useCategories } from "../../hooks/useCategories";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { getErrorMessage } from "../../../../shared/types/errors.types";
import { IMAGES_CONFIG, handleImageError } from "../../../../shared/constants/images";

// ✅ CORRECTION : Utiliser la constante depuis product.types
const DEFAULT_ADMIN_FILTERS: AdminProductFilters = {
  page: 0,
  size: 10,
  sortBy: "NAME",
  sortDirection: "ASC",
  activeOnly: null // ✅ null au lieu de false
};

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const filters = useMemo((): AdminProductFilters => {
    const page = parseInt(searchParams.get("page") || DEFAULT_ADMIN_FILTERS.page.toString());
    const size = parseInt(searchParams.get("size") || DEFAULT_ADMIN_FILTERS.size.toString());
    const sortBy = (searchParams.get("sortBy") as AdminProductFilters['sortBy']) || DEFAULT_ADMIN_FILTERS.sortBy;
    const sortDirection = (searchParams.get("sortDirection") as AdminProductFilters['sortDirection']) || DEFAULT_ADMIN_FILTERS.sortDirection;
    
    // ✅ CORRECTION : Gérer correctement activeOnly (boolean | null)
    const activeOnlyParam = searchParams.get("activeOnly");
    let activeOnly: boolean | null;
    
    if (activeOnlyParam === "true") {
      activeOnly = true;
    } else if (activeOnlyParam === "false") {
      activeOnly = false;
    } else {
      activeOnly = null; // Tous les produits
    }

    return {
      page,
      size,
      query: searchParams.get("query") || undefined,
      category: searchParams.get("category") || undefined,
      sortBy,
      sortDirection,
      activeOnly
    };
  }, [searchParams]);

  const { products, loading: productsLoading, pagination, refetch } = useAdminProducts(filters);
  const { categories, loading: categoriesLoading } = useCategories();

  const safeCategories = Array.isArray(categories) ? categories : [];
  const isLoading = productsLoading || categoriesLoading;

  // ✅ CORRECTION : updateFilters gère activeOnly (boolean | null)
  const updateFilters = useCallback((updates: Partial<AdminProductFilters>) => {
    console.log("🔄 AdminProducts - updateFilters:", updates);
    
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      // ✅ CORRECTION : Gérer null correctement
      if (value === undefined || value === "" || value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    // Réinitialiser page si changement de filtres
    const isChangingFilters = Object.keys(updates).some(k => 
      ['query', 'category', 'activeOnly', 'sortBy', 'sortDirection'].includes(k)
    );
    
    if (isChangingFilters && !updates.page) {
      newParams.set("page", "0");
    }
    
    console.log("📤 AdminProducts - Nouvelle URL:", newParams.toString());
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    console.log("📄 AdminProducts - Changement de page:", newPage);
    updateFilters({ page: newPage });
  }, [updateFilters]);

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }

    try {
      await apiClient.delete(`/products/${productId}`);
      toast.success("✅ Produit supprimé avec succès");
      refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRestoreProduct = async (productId: number) => {
    try {
      await apiClient.patch(`/products/admin/${productId}/restore`);
      toast.success("✅ Produit restauré avec succès");
      refetch();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleViewProduct = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const getCategoryName = (categoryCode: string): string => {
    const category = safeCategories.find(cat => cat.code === categoryCode);
    return category ? category.name : categoryCode || "—";
  };

  if (isLoading && products.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Header 
        totalProducts={pagination.totalElements} 
        activeOnly={filters.activeOnly}
        onToggleActiveOnly={(value) => {
          console.log("🔄 Toggle activeOnly:", value);
          updateFilters({ activeOnly: value });
        }}
      />

      <AdminFilterBar
        filters={filters}
        categories={safeCategories}
        onFilterChange={updateFilters}
        onReset={handleResetFilters}
      />

      <ProductsTable
        products={products}
        getCategoryName={getCategoryName}
        onViewProduct={handleViewProduct}
        onDeleteProduct={handleDeleteProduct}
        onRestoreProduct={handleRestoreProduct}
        isLoading={isLoading}
      />

      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

// ✅ CORRECTION : Mettre à jour HeaderProps pour accepter boolean | null
interface HeaderProps {
  totalProducts: number;
  activeOnly: boolean | null; // ✅ Changer de boolean à boolean | null
  onToggleActiveOnly: (value: boolean | null) => void; // ✅ Accepter boolean | null
}

const Header = ({ totalProducts, activeOnly, onToggleActiveOnly }: HeaderProps) => {
  // ✅ CORRECTION : Fonction helper pour déterminer la valeur actuelle
  const getCurrentStatus = (): string => {
    if (activeOnly === true) return "active";
    if (activeOnly === false) return "inactive";
    return "all";
  };

  // ✅ CORRECTION : Gestion sécurisée du changement
  const handleStatusChange = (value: string) => {
    console.log("🔄 Changement statut:", value);
    
    switch (value) {
      case "active":
        onToggleActiveOnly(true);
        break;
      case "inactive":
        onToggleActiveOnly(false);
        break;
      default:
        onToggleActiveOnly(null);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Produits
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {totalProducts} produit{totalProducts > 1 ? "s" : ""} au total
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* ✅ FILTRE STATUT CORRIGÉ */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Statut:
          </label>
          <select
            value={getCurrentStatus()}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les produits</option>
            <option value="active">Produits actifs seulement</option>
            <option value="inactive">Produits inactifs seulement</option>
          </select>
        </div>

        <Link
          to="/admin/products/upload"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-dark transition shadow-md font-medium"
        >
          + Nouveau Produit
        </Link>
      </div>
    </div>
  );
};

// ✅ CORRECTION : Mettre à jour AdminFilterBarProps
interface AdminFilterBarProps {
  filters: AdminProductFilters;
  categories: Category[];
  onFilterChange: (updates: Partial<AdminProductFilters>) => void;
  onReset: () => void;
}

const AdminFilterBar = ({ filters, categories, onFilterChange, onReset }: AdminFilterBarProps) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const hasActiveFilters = filters.query || filters.category;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔍 Rechercher
          </label>
          <input
            type="text"
            value={filters.query || ""}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder="Nom du produit..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📁 Catégorie
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Toutes les catégories</option>
            {safeCategories.map((category) => (
              <option key={category.code} value={category.code}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔄 Trier par
          </label>
          <select
            value={`${filters.sortBy},${filters.sortDirection}`}
            onChange={(e) => {
              const [sortBy, sortDirection] = e.target.value.split(",") as [AdminProductFilters['sortBy'], AdminProductFilters['sortDirection']];
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

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onReset}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
          >
            <span>↺</span>
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};

interface ProductsTableProps {
  products: Product[];
  getCategoryName: (code: string) => string;
  onViewProduct: (id: number) => void;
  onDeleteProduct: (id: number) => void;
  onRestoreProduct: (id: number) => void;
  isLoading: boolean;
}

const ProductsTable = ({
  products,
  getCategoryName,
  onViewProduct,
  onDeleteProduct,
  onRestoreProduct,
  isLoading
}: ProductsTableProps) => {
  if (products.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <TableHeader />
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <ProductRow
                key={product.productId}
                product={product}
                getCategoryName={getCategoryName}
                onViewProduct={onViewProduct}
                onDeleteProduct={onDeleteProduct}
                onRestoreProduct={onRestoreProduct}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TableHeader = () => (
  <thead className="bg-gray-50 dark:bg-gray-700">
    <tr>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        Produit
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        Catégorie
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        Prix
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        Stock
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        Statut
      </th>
      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
);

interface ProductRowProps {
  product: Product;
  getCategoryName: (code: string) => string;
  onViewProduct: (id: number) => void;
  onDeleteProduct: (id: number) => void;
  onRestoreProduct: (id: number) => void;
}

const ProductRow = ({
  product,
  getCategoryName,
  onViewProduct,
  onDeleteProduct,
  onRestoreProduct
}: ProductRowProps) => {
  const isActive = product.isActive !== false;
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
      <ProductCell product={product} />
      <CategoryCell product={product} getCategoryName={getCategoryName} />
      <PriceCell product={product} />
      <StockCell product={product} />
      <StatusCell isActive={isActive} />
      <ActionsCell 
        product={product}
        isActive={isActive}
        onViewProduct={onViewProduct}
        onDeleteProduct={onDeleteProduct}
        onRestoreProduct={onRestoreProduct}
      />
    </tr>
  );
};

const ProductCell = ({ product }: { product: Product }) => {
  const imageUrl = IMAGES_CONFIG.getProductImage(product.imageUrl);
  
  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center gap-3">
        {product.imageUrl ? (
          <img
            className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
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
            ID: {product.productId}
          </div>
        </div>
      </div>
    </td>
  );
};

const CategoryCell = ({ product, getCategoryName }: { product: Product; getCategoryName: (code: string) => string }) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <div className="text-sm font-semibold text-gray-900 dark:text-white">
      {product.categoryCode ? getCategoryName(product.categoryCode) : "—"}
    </div>
  </td>
);

const PriceCell = ({ product }: { product: Product }) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <div className="text-sm font-semibold text-gray-900 dark:text-white">
      {product.price?.toFixed(2) || "0.00"} €
    </div>
  </td>
);

const StockCell = ({ product }: { product: Product }) => {
  const validatedStock = Number(product.stockQuantity) || 0;
  
  let status;
  if (validatedStock > 50) {
    status = { 
      class: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100", 
      text: `${validatedStock} unités`, 
      emoji: "🟢" 
    };
  } else if (validatedStock > 10) {
    status = { 
      class: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100", 
      text: `${validatedStock} unités`, 
      emoji: "🔵" 
    };
  } else if (validatedStock > 0) {
    status = { 
      class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100", 
      text: `${validatedStock} unités`, 
      emoji: "🟡" 
    };
  } else {
    status = { 
      class: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100", 
      text: "Rupture", 
      emoji: "🔴" 
    };
  }

  return (
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${status.class}`}>
        <span>{status.emoji}</span>
        {status.text}
      </span>
    </td>
  );
};

const StatusCell = ({ isActive }: { isActive: boolean }) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
      isActive 
        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
    }`}>
      {isActive ? "🟢 Actif" : "🔴 Inactif"}
    </span>
  </td>
);

interface ActionsCellProps {
  product: Product;
  isActive: boolean;
  onViewProduct: (id: number) => void;
  onDeleteProduct: (id: number) => void;
  onRestoreProduct: (id: number) => void;
}

const ActionsCell = ({
  product,
  isActive,
  onViewProduct,
  onDeleteProduct,
  onRestoreProduct
}: ActionsCellProps) => (
  <td className="px-6 py-4 whitespace-nowrap">
    <div className="flex items-center gap-2">
      <Link
        to={`/admin/products/edit/${product.productId}`}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm px-3 py-1 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        title="Modifier le produit"
      >
        ✏️
      </Link>
      <Link
        to={`/admin/products/${product.productId}/gallery`}
        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm px-3 py-1 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
        title="Gérer la galerie"
      >
        🖼️
      </Link>
      <button
        onClick={() => onViewProduct(product.productId)}
        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm px-3 py-1 rounded border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
        title="Voir le produit"
      >
        👁️
      </button>
      
      {!isActive ? (
        <button
          onClick={() => onRestoreProduct(product.productId)}
          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm px-3 py-1 rounded border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
          title="Restaurer le produit"
        >
          🔄
        </button>
      ) : (
        <button
          onClick={() => onDeleteProduct(product.productId)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm px-3 py-1 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          title="Supprimer le produit"
        >
          🗑️
        </button>
      )}
    </div>
  </td>
);

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des produits...</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📦</div>
    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
      Aucun produit trouvé
    </p>
    <p className="text-gray-400 dark:text-gray-500 text-sm">
      Commencez par ajouter votre premier produit
    </p>
    <Link
      to="/admin/products/upload"
      className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-dark transition"
    >
      Créer un produit
    </Link>
  </div>
);