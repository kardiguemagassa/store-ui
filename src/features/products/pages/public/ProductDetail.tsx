import React, { useState, useRef, type JSX } from "react";
import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faShoppingCart,
  faShoppingBasket,
} from "@fortawesome/free-solid-svg-icons";
import type { Product } from "../../types/product.types";

import { addToCart } from "../../../cart/store/cartSlice"; 
import { useAppDispatch } from "../../../auth/hooks/redux";
import { handleImageError, IMAGES_CONFIG } from "../../../../shared/constants/images";


export default function ProductDetail(): JSX.Element {
  
  const product = useLoaderData() as Product;
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // ÉTATS LOCAUX
  const [quantity, setQuantity] = useState<number>(1);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [backgroundPosition, setBackgroundPosition] = useState<string>("center");
  
  const zoomRef = useRef<HTMLDivElement>(null);

  const imageUrl = IMAGES_CONFIG.getProductImage(product?.imageUrl);

  // FONCTIONS
  const handleAddToCart = (): void => {
    if (quantity < 1) return;
    dispatch(addToCart({ product, quantity }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!zoomRef.current) return;
    
    const { left, top, width, height } = zoomRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const handleMouseEnter = (): void => {
    setIsHovering(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovering(false);
    setBackgroundPosition("center");
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  const handleViewCart = (): void => {
    navigate("/cart");
  };

  // GESTION PRODUIT NON TROUVÉ
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
          ref={zoomRef}
          onMouseMove={isHovering ? handleMouseMove : undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="w-full md:w-1/2 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-hidden bg-cover cursor-zoom-in"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: isHovering ? "200%" : "cover",
            backgroundPosition: backgroundPosition,
            transition: "background-size 0.3s ease",
          }}
        >
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full opacity-0"
            onError={handleImageError} // Utiliser la fonction centralisée d'image
          />
        </div>

        {/* SECTION DÉTAILS */}
        <div className="w-full md:w-1/2 flex flex-col space-y-6 mt-8 md:mt-0">
          <Link
            to="/home"
            className="inline-flex items-center text-primary dark:text-light font-medium hover:text-dark dark:hover:text-lighter transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Retour à tous les produits
          </Link>

          {/* INFORMATIONS */}
          <div>
            <h1 className="text-3xl font-extrabold text-primary dark:text-light mb-4">
              {product.name}
            </h1>
            <p className="text-lg text-dark dark:text-lighter mb-4">
              {product.description}
            </p>
            <div className="text-2xl font-bold text-primary dark:text-light">
              {product.price.toFixed(2)} €
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col space-y-4">
            
            {/* QUANTITÉ */}
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

            {/* BOUTONS */}
            <button
              onClick={handleAddToCart}
              className="w-full px-4 py-3 bg-primary dark:bg-light text-white dark:text-black rounded-md text-lg font-semibold hover:bg-dark dark:hover:bg-lighter transition duration-200"
              aria-label={`Add ${quantity} ${product.name} to cart`}
            >
              Ajouter au panier
              <FontAwesomeIcon icon={faShoppingCart} className="ml-2" />
            </button>

            <button
              onClick={handleViewCart}
              className="w-full px-4 py-3 bg-primary dark:bg-light text-white dark:text-black rounded-md text-lg font-semibold hover:bg-dark dark:hover:bg-lighter transition duration-200"
              aria-label="View shopping cart"
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