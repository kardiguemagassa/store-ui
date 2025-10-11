import React, { useState, useRef, type JSX } from "react";
import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faShoppingCart,
  faShoppingBasket,
} from "@fortawesome/free-solid-svg-icons";
import type { Product } from "../types/product";
import { useAppDispatch } from "../hooks/redux"; 
import { addToCart } from "../store/cartSlice"; 

export default function ProductDetail(): JSX.Element {
  
  // useLoaderData() récupère les données du loader React Router
  const product = useLoaderData() as Product;
  
  // HOOKS DE NAVIGATION
  const navigate = useNavigate(); // Pour changer de page
  const dispatch = useAppDispatch(); // Pour envoyer des actions Redux
  
  // ÉTATS LOCAUX DU COMPOSANT
  const [quantity, setQuantity] = useState<number>(1); // Quantité sélectionnée
  const [isHovering, setIsHovering] = useState<boolean>(false); // Souris sur l'image
  const [backgroundPosition, setBackgroundPosition] = useState<string>("center"); // Position zoom
  
  // RÉFÉRENCE POUR L'EFFET DE ZOOM
  const zoomRef = useRef<HTMLDivElement>(null);

  // FONCTION : AJOUTER AU PANIER
  const handleAddToCart = (): void => {
    if (quantity < 1) return; // Validation sécurité
    // DISPATCH REDUX : Envoie l'action au store
    dispatch(addToCart({ product, quantity }));
  };

  // FONCTION : GESTION DU ZOOM AU SURVOL
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!zoomRef.current) return;
    
    // CALCUL DE LA POSITION RELATIVE DE LA SOURIS
    const { left, top, width, height } = zoomRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100; // Pourcentage horizontal
    const y = ((e.pageY - top) / height) * 100; // Pourcentage vertical
    
    // MISE À JOUR DE LA POSITION DU BACKGROUND
    setBackgroundPosition(`${x}% ${y}%`);
  };

  // DÉBUT DU SURVOL
  const handleMouseEnter = (): void => {
    setIsHovering(true); // Active l'effet de zoom
  };

  // FIN DU SURVOL
  const handleMouseLeave = (): void => {
    setIsHovering(false); // Désactive l'effet de zoom
    setBackgroundPosition("center"); // Recentre l'image
  };

  // CHANGEMENT DE QUANTITÉ
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    // 🛡️ VALIDATION : Minimum 1
    setQuantity(value > 0 ? value : 1);
  };

  // ALLER AU PANIER
  const handleViewCart = (): void => {
    navigate("/cart"); // Navigation vers la page panier
  };

  // GESTION DU CAS OÙ LE PRODUIT N'EXISTE PAS
  if (!product) {
    return (
      <div className="min-h-[852px] flex items-center justify-center px-6 py-8 font-primary bg-normalbg dark:bg-darkbg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary dark:text-light mb-4">
            Produit non trouvé
          </h2>
          <Link
            to="/home"
            className="text-primary dark:text-light hover:text-dark dark:hover:text-lighter font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[852px] flex items-center justify-center px-6 py-8 font-primary bg-normalbg dark:bg-darkbg">
      <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row md:space-x-8 px-6 p-8">
        
        {/* SECTION IMAGE AVEC EFFET DE ZOOM */}
        <div
          ref={zoomRef} // Référence pour les calculs de position
          onMouseMove={isHovering ? handleMouseMove : undefined} // Zoom seulement si survol actif
          onMouseEnter={handleMouseEnter} // Début du survol
          onMouseLeave={handleMouseLeave} // Fin du survol
          className="w-full md:w-1/2 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-hidden bg-cover cursor-zoom-in"
          style={{
            backgroundImage: `url(${product.imageUrl})`, // Image de fond pour le zoom
            backgroundSize: isHovering ? "200%" : "cover", // Zoom x2 au survol
            backgroundPosition: backgroundPosition, // Position dynamique
            transition: "background-size 0.3s ease", // Animation fluide
          }}
        >
          {/* IMAGE INVISIBLE (juste pour la sémantique HTML) */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full opacity-0" // Invisible mais présente pour l'accessibilité
          />
        </div>

        {/* SECTION DÉTAILS DU PRODUIT */}
        <div className="w-full md:w-1/2 flex flex-col space-y-6 mt-8 md:mt-0">
          <Link
            to="/home"
            className="inline-flex items-center text-primary dark:text-light font-medium hover:text-dark dark:hover:text-lighter transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour à tous les produits
          </Link>

          {/* INFORMATIONS DU PRODUIT */}
          <div>
            <h1 className="text-3xl font-extrabold text-primary dark:text-light mb-4">
              {product.name}
            </h1>
            <p className="text-lg text-dark dark:text-lighter mb-4">
              {product.description}
            </p>
            {/* PRIX */}
            <div className="text-2xl font-bold text-primary dark:text-light">
              {product.price.toFixed(2)} €
            </div>
          </div>

          {/* SECTION ACTIONS */}
          <div className="flex flex-col space-y-4">
            
            {/* SÉLECTEUR DE QUANTITÉ */}
            <div className="flex items-center space-x-4">
              <label
                htmlFor="quantity"
                className="text-lg font-semibold text-primary dark:text-light"
              >
                Qté:
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 px-3 py-2 border border-primary dark:border-light rounded-md focus:ring-2 focus:ring-primary dark:focus:ring-light focus:outline-none dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition"
              />
            </div>

            {/* BOUTON AJOUTER AU PANIER */}
            <button
              onClick={handleAddToCart}
              className="w-full px-4 py-3 bg-primary dark:bg-light text-white dark:text-black rounded-md text-lg font-semibold hover:bg-dark dark:hover:bg-lighter transition duration-200"
              aria-label={`Add ${quantity} ${product.name} to cart`} // Accessibilité
            >
              Ajouter au panier
              <FontAwesomeIcon icon={faShoppingCart} className="ml-2" />
            </button>

            {/* BOUTON VOIR LE PANIER */}
            <button
              onClick={handleViewCart}
              className="w-full px-4 py-3 bg-primary dark:bg-light text-white dark:text-black rounded-md text-lg font-semibold hover:bg-dark dark:hover:bg-lighter transition duration-200"
              aria-label="View shopping cart" // Accessibilité
            >
              Voir le panier
              <FontAwesomeIcon icon={faShoppingBasket} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}