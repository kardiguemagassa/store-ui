import { useMemo, useState } from "react";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";
import SearchBox from "./SearchBox";
import Dropdown from "./Dropdown";

interface ProductListingsProps {
  products: Product[];
}

const sortList = ["Popularité", "Prix du plus bas au plus élevé", "Prix du plus élevé au plus bas"];

export default function ProductListings({ products }: ProductListingsProps) {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("Popularité");

  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return [];
    }

    // ÉTAPE 1 : Filtrage avec gestion de description optionnelle
    const filteredProducts = products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchText.toLowerCase());
      
      // CORRECTION : Vérifie si description existe avant de l'utiliser
      const descriptionMatch = product.description 
        ? product.description.toLowerCase().includes(searchText.toLowerCase())
        : false;
      
      return nameMatch || descriptionMatch;
    });

    // ÉTAPE 2 : Tri avec gestion de popularité manquante
    return filteredProducts.slice().sort((a, b) => {
      switch (selectedSort) {
        case "Prix du plus bas au plus élevé":
          return a.price - b.price;
          
        case "Prix du plus élevé au plus bas":
          return b.price - a.price;
          
        case "Popularité":
        default:
          // Option 1: Trier par nom (ordre alphabétique)
          return a.name.localeCompare(b.name);
          
          // Option 2: Trier par ID (plus récent en premier)
          // return b.productId - a.productId;
          
          // Option 3: Trier par prix (comme défaut)
          // return a.price - b.price;
      }
    });
  }, [products, searchText, selectedSort]);

  function handleSearchChange(inputSearch: string) {
    setSearchText(inputSearch);
  }

  function handleSortChange(sortType: string) {
    setSelectedSort(sortType);
  }

  return (
    <div className="max-w-[1152px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-12">
        <SearchBox
          label="Recherche"
          placeholder="Produit par nom ..."
          value={searchText}
          handleSearch={handleSearchChange}
        />
        <Dropdown
          label="Trier par"
          options={sortList}
          selectedValue={selectedSort}
          handleSort={handleSortChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 py-12">
        {filteredAndSortedProducts.length > 0 ? (
          filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))
        ) : (
          <p className="text-center font-primary font-bold text-lg text-primary dark:text-light">
            Aucun produit trouvé
          </p>
        )}
      </div>
    </div>
  );
}