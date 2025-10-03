import { useMemo, useState } from "react";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";
import SearchBox from "./SearchBox";
import Dropdown from "./Dropdown";

// 📋 Interface TypeScript : définit les props attendues par le composant
interface ProductListingsProps {
  products: Product[]; // Tableau de produits reçu du loader via useLoaderData()
}

// 📊 Liste des options de tri disponibles
// Utilisée par le composant Dropdown
const sortList = ["Popularité", "Prix du plus bas au plus élevé", "Prix du plus élevé au plus bas"];

export default function ProductListings({ products }: ProductListingsProps) {
  // 🔍 State local : texte de recherche saisi par l'utilisateur
  // useState<string>("") : initialise avec une chaîne vide
  const [searchText, setSearchText] = useState<string>("");
  
  // 🔀 State local : option de tri sélectionnée
  // Par défaut : "Popularité"
  const [selectedSort, setSelectedSort] = useState<string>("Popularité");

  // ⚡ useMemo : optimisation des performances
  // Recalcule filteredAndSortedProducts UNIQUEMENT si products, searchText ou selectedSort changent
  // Sans useMemo, le filtrage/tri se ferait à chaque re-render (même inutile)
  const filteredAndSortedProducts = useMemo(() => {
    // 🛡️ Garde de sécurité : vérifie que products est bien un tableau
    // Évite les crashs si products est null/undefined
    if (!Array.isArray(products)) {
      return [];
    }

    // 🔍 ÉTAPE 1 : Filtrage
    // .filter() : crée un nouveau tableau avec uniquement les éléments qui satisfont la condition
    // includes() : vérifie si la chaîne contient le texte recherché
    // toLowerCase() : rend la recherche insensible à la casse (majuscules/minuscules)
    const filteredProducts = products.filter(
      (product) =>
        // Cherche dans le nom OU dans la description
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
    );

    // 🔀 ÉTAPE 2 : Tri
    // .slice() : crée une copie du tableau (évite de modifier l'original)
    // .sort() : trie le tableau selon la fonction de comparaison
    return filteredProducts.slice().sort((a, b) => {
      // switch : choisit l'algorithme de tri selon selectedSort
      switch (selectedSort) {
        case "Prix du plus bas au plus élevé":
          // a.price - b.price : tri croissant (du plus petit au plus grand)
          // Si résultat négatif : a avant b
          // Si résultat positif : b avant a
          return a.price - b.price;
          
        case "Prix du plus élevé au plus bas":
          // b.price - a.price : tri décroissant (du plus grand au plus petit)
          return b.price - a.price;
          
        case "Popularity":
        default:
          // b.popularity - a.popularity : tri décroissant par popularité
          // Les produits les plus populaires apparaissent en premier
          return b.popularity - a.popularity;
      }
    });
  }, [products, searchText, selectedSort]); // 🎯 Dépendances : recalcule si l'une change

  // 📝 Handler : met à jour le texte de recherche
  // Appelé par SearchBox via onChange
  // Typage explicite pour la sécurité TypeScript
  function handleSearchChange(inputSearch: string) {
    setSearchText(inputSearch);
  }

  // 🔀 Handler : met à jour l'option de tri
  // Appelé par Dropdown via onChange
  function handleSortChange(sortType: string) {
    setSelectedSort(sortType);
  }

  return (
    <div className="max-w-[1152px] mx-auto">
      
      {/* 🎛️ Barre de contrôles : recherche + tri */}
      {/* flex-col sur mobile (sm:), flex-row sur desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-12">
        
        {/* 🔍 Composant SearchBox : champ de recherche */}
        {/* Controlled component : value et handleSearch gèrent le state */}
        <SearchBox
          label="Recherche"
          placeholder="Produit par nom ..."
          value={searchText}              // État actuel
          handleSearch={handleSearchChange} // Callback pour mettre à jour
        />
        
        {/* 📊 Composant Dropdown : menu déroulant de tri */}
        <Dropdown
          label="Trier par"
          options={sortList}              // Options disponibles
          selectedValue={selectedSort}     // Option actuellement sélectionnée
          handleSort={handleSortChange}    // Callback pour changer le tri
        />
      </div>

      {/* 🎴 Grille de produits */}
      {/* grid-cols-1 : 1 colonne sur mobile */}
      {/* sm:grid-cols-2 : 2 colonnes sur tablette */}
      {/* lg:grid-cols-3 : 3 colonnes sur desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 py-12">
        
        {/* Affichage conditionnel : produits OU message "aucun résultat" */}
        {filteredAndSortedProducts.length > 0 ? (
          // ✅ Cas 1 : il y a des produits à afficher
          // .map() : transforme chaque produit en composant ProductCard
          // key={product.productId} : obligatoire pour que React optimise le rendu
          filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))
        ) : (
          // ❌ Cas 2 : aucun produit ne correspond aux filtres
          <p className="text-center font-primary font-bold text-lg text-primary dark:text-light">
            No products found
          </p>
        )}
      </div>
    </div>
  );
}