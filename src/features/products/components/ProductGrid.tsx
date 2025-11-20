/**
 * PRODUCT GRID - VERSION AVEC SUPPORT CLEAR SEARCH
 */

import { Link } from "react-router-dom";
import { useAppDispatch } from "../../auth/hooks/redux";
import { addToCart } from "../../cart/store/cartSlice";
import Price from "../../../shared/components/Price";
import { IMAGES_CONFIG, handleImageError } from "../../../shared/constants/images";
import SearchBox from "../../../shared/components/SearchBox";
import Dropdown from "./Dropdown";
import type { Product, SortOption } from "../types/product.types";

interface ProductGridProps {
  products: Product[];
  currentSearch: string;
  currentSort: SortOption;
  onSearchChange: (query: string) => void;
  onClearSearch?: () => void;
  onSortChange: (sort: SortOption) => void;
  loading?: boolean;
  showActions?: boolean;
}

export default function ProductGrid({ 
  products = [],
  currentSearch,
  currentSort, 
  onSearchChange,
  onClearSearch,
  onSortChange,
  loading = false,
  showActions = true
}: ProductGridProps) {
  
  const sortList: SortOption[] = [
    "Popularité",
    "Prix du plus bas au plus élevé", 
    "Prix du plus élevé au plus bas",
    "Nouveautés"
  ];

  // ✅ Gestion du clear sans modifier SearchBox
  const handleSearchWithClear = (query: string) => {
    if (query === "" && onClearSearch) {
      onClearSearch(); // ✅ Utiliser le handler dédié pour vider
    } else {
      onSearchChange(query); // ✅ Recherche normale
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="max-w-[1152px] mx-auto">
      {/* Barre de recherche et tri */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <SearchBox
          label="Recherche"
          placeholder="Rechercher un produit..."
          value={currentSearch}
          handleSearch={handleSearchWithClear} // ✅ Utiliser le wrapper
          disabled={loading}
        />
        <Dropdown
          label="Trier par"
          options={sortList}
          selectedValue={currentSort}
          handleSort={onSortChange}
          disabled={loading}
        />
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Chargement...</p>
        </div>
      )}

      {/* Grille de produits */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 py-8">
          {safeProducts.length > 0 ? (
            safeProducts.map((product) => (
              <ProductCard 
                key={product.productId} 
                product={product}
                showActions={showActions}
              />
            ))
          ) : (
            <EmptyState currentSearch={currentSearch} />
          )}
        </div>
      )}
    </div>
  );
}

// Sous-composants restent identiques...
interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

function ProductCard({ product, showActions = true }: ProductCardProps) {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    if (showActions) {
      dispatch(addToCart({ product, quantity: 1 }));
    }
  };

  const imageUrl = IMAGES_CONFIG.getProductImage(product.imageUrl);

  return (
    <div className="w-72 rounded-md mx-auto border border-gray-300 dark:border-gray-600 shadow-md overflow-hidden flex flex-col bg-white dark:bg-gray-800 hover:border-primary dark:hover:border-lighter transition">
      <Link
        to={`/products/${product.productId}`}
        state={{ product }}
        className="relative w-full h-72 border-b border-gray-300 dark:border-gray-600"
      >
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"  
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
        />
      </Link>
      <div className="relative h-48 p-4 flex flex-col font-primary">
        <h2 className="text-xl font-semibold text-primary dark:text-light mb-2">
          {product.name}
        </h2>
        <p className="text-base text-gray-600 dark:text-lighter mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="bg-lighter dark:bg-light text-primary font-medium text-sm py-2 px-4 rounded-tl-md">
            <Price price={product.price} />
          </div>
          {showActions && (
            <button
              className="bg-primary dark:bg-light text-white dark:text-primary font-medium text-sm py-2 px-4 rounded-md hover:cursor-pointer hover:bg-dark dark:hover:bg-lighter transition-colors"
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const EmptyState = ({ currentSearch }: { currentSearch: string }) => (
  <div className="col-span-full text-center py-16">
    <div className="text-6xl mb-4">📦</div>
    <p className="font-primary font-bold text-2xl text-gray-600 dark:text-gray-400 mb-2">
      Aucun produit trouvé
    </p>
    <p className="text-gray-500 dark:text-gray-500">
      {currentSearch ? (
        <>Aucun résultat pour "{currentSearch}"</>
      ) : (
        <>Essayez de modifier vos critères de recherche</>
      )}
    </p>
  </div>
);