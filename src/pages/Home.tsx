import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeading from "../shared/components/PageHeading";
import ProductGrid from "../features/products/components/ProductGrid";
import Pagination from "../shared/components/Pagination";
import { useProducts } from "../features/products/hooks/useProducts";

import { 
  SORT_MAPPING, 
  getSortOptionFromParams,
  type SortOption,
  type PublicProductFilters,
  DEFAULT_PUBLIC_FILTERS
} from "../features/products/types/product.types";
import { logger } from "../shared/types/errors.types";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filtres depuis URL (memoized pour stabilité)
  const filters = useMemo((): PublicProductFilters => {
    const page = parseInt(searchParams.get("page") || DEFAULT_PUBLIC_FILTERS.page.toString());
    const size = parseInt(searchParams.get("size") || DEFAULT_PUBLIC_FILTERS.size.toString());
    const sortBy = (searchParams.get("sortBy") as PublicProductFilters['sortBy']) || DEFAULT_PUBLIC_FILTERS.sortBy;
    const sortDirection = (searchParams.get("sortDirection") as PublicProductFilters['sortDirection']) || DEFAULT_PUBLIC_FILTERS.sortDirection;
    
    logger.debug("Filtres extraits de l'URL", "Home", {
      page,
      size,
      sortBy,
      sortDirection,
      hasQuery: !!searchParams.get("query"),
      hasCategory: !!searchParams.get("category")
    });
    
    return {
      page,
      size,
      query: searchParams.get("query") || undefined,
      category: searchParams.get("category") || undefined,
      sortBy,
      sortDirection
    };
  }, [searchParams]);

  // Hook qui charge les produits
  const { products = [],loading, error, pagination } = useProducts(filters);

  // Handler de pagination stabilisé
  const handlePageChange = useCallback((newPage: number) => {
    logger.info("Changement de page", "Home", { 
      fromPage: filters.page,
      toPage: newPage 
    });
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, filters.page]);

  // NE PAS réinitialiser la page lors d'une recherche
  const handleSearchChange = useCallback((query: string) => {
    logger.info("Changement recherche", "Home", { 
      query: query || "(vide)",
      currentPage: filters.page 
    });
    
    const newParams = new URLSearchParams(searchParams);
    
    if (query.trim()) {
      newParams.set('query', query.trim());
    } else {
      newParams.delete('query');
    }
    
    // LAISSER la page actuelle lors d'une recherche
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, filters.page]);

  // Réinitialiser la page seulement si nécessaire
  const handleSortChange = useCallback((sortType: SortOption) => {
    const { sortBy, sortDirection } = SORT_MAPPING[sortType];
    
    logger.info("Changement tri", "Home", { 
      sortType,
      sortBy,
      sortDirection,
      currentPage: filters.page 
    });
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortBy);
    newParams.set('sortDirection', sortDirection);
    
    // Garder la page actuelle lors du changement de tri
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, filters.page]);

  // vider la recherche ET réinitialiser la page
  const handleClearSearch = useCallback(() => {
    logger.info("Vidage recherche", "Home", { 
      previousPage: filters.page 
    });
    
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('query');
    newParams.set('page', '0'); // Réinitialiser seulement quand on vide explicitement
    
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams, filters.page]);

  // Calcul du tri courant pour l'UI (memoized)
  const currentSort = useMemo((): SortOption => {
    return getSortOptionFromParams(filters.sortBy, filters.sortDirection);
  }, [filters.sortBy, filters.sortDirection]);

  // Props pour ProductGrid (memoized)
  const productGridProps = useMemo(() => ({
    products: products || [],
    currentSearch: filters.query || "",
    currentSort,
    onSearchChange: handleSearchChange,
    onClearSearch: handleClearSearch,
    onSortChange: handleSortChange,
    loading,
    showActions: true
  }), [products, filters.query, currentSort, handleSearchChange, handleClearSearch, handleSortChange, loading]);

  // Pagination sécurisée
  const safePagination = pagination || {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12
  };

  // Debug state (seulement en développement)
  logger.debug("État Home", "Home", {
    productsCount: products.length,
    currentPage: safePagination.currentPage,
    totalPages: safePagination.totalPages,
    totalElements: safePagination.totalElements,
    loading,
    hasError: !!error
  });

  // État de chargement initial
  if (loading && (products || []).length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Chargement des produits...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error && (products || []).length === 0) {
    logger.error("Erreur chargement produits", "Home", error);
    
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Oups ! Une erreur s'est produite
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-dark transition-colors shadow-md"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* En-tête */}
      <PageHeading title="Découvrez nos Autocollants">
        Ajoutez une touche de créativité à votre espace avec notre large gamme d'autocollants amusants et uniques. Parfaits pour toutes les occasions!
      </PageHeading>

      {/* Contenu principal */}
      <div className="flex-1">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info résultats */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {safePagination.totalElements}
              </span>{' '}
              produit{safePagination.totalElements > 1 ? 's' : ''} trouvé{safePagination.totalElements > 1 ? 's' : ''}
            </p>
            
            {safePagination.totalPages > 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Page {safePagination.currentPage + 1} sur {safePagination.totalPages}
              </p>
            )}
          </div>

          {/* Grille de produits */}
          <ProductGrid {...productGridProps} />

          {/* Pagination */}
          {safePagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={safePagination.currentPage}
                totalPages={safePagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de chargement navigation */}
      {loading && (products || []).length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-200 dark:border-gray-700 z-50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Chargement...
          </span>
        </div>
      )}
    </div>
  );
}