import React, { useMemo } from "react";
import PageTitle from "./PageTitle";
import { Link } from "react-router-dom";
import emptyCartImage from "../assets/util/emptycart.png";
import { useAppSelector } from "../hooks/redux";
import { selectCartItems, selectTotalPrice, selectTotalQuantity } from "../store/cartSlice"; 
import CartTable from "./CartTable";
import { useAuth } from "../hooks/useAuth";

export default function Cart() {
  
  // HOOKS - récupération des données globales AVEC REDUX
  const cart = useAppSelector(selectCartItems); 
  const totalPrice = useAppSelector(selectTotalPrice); 
  const totalQuantity = useAppSelector(selectTotalQuantity);
  
  const { isAuthenticated, user } = useAuth();

  // MÉMOISATION - Vérification de l'adresse utilisateur 
  const isAddressIncomplete = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    
    // Accéder à l'adresse via user.address
    const { address } = user;
    if (!address) return true;
    
    const { street, city, state, postalCode, country } = address;
    return !street || !city || !state || !postalCode || !country;
  }, [isAuthenticated, user]);

  // MÉMOISATION - Vérification du panier vide
  const isCartEmpty = useMemo(() => cart.length === 0, [cart.length]);

  // STYLES - Classes CSS réutilisables
  const buttonBaseClass = "py-2 px-4 text-xl font-semibold rounded-sm flex justify-center items-center transition";
  const primaryButtonClass = `${buttonBaseClass} bg-primary dark:bg-light text-white dark:text-black hover:bg-dark dark:hover:bg-lighter`;
  const disabledButtonClass = `${buttonBaseClass} bg-gray-400 cursor-not-allowed text-white dark:text-black`;

  // Afficher l'état de l'adresse
  console.log("User address:", user?.address);
  console.log("Is address incomplete:", isAddressIncomplete);

  return (
    <div className="min-h-[852px] py-12 bg-normalbg dark:bg-darkbg font-primary">
      <div className="max-w-4xl mx-auto px-4">
        <PageTitle title="Votre panier" />
        
        {!isCartEmpty ? (
          <>
            {isAddressIncomplete && (
              <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-200 text-lg text-center">
                  Veuillez mettre à jour votre adresse dans votre profil pour procéder au paiement.
                </p>
              </div>
            )}

            {/* TABLEAU DU PANIER */}
            <CartTable />

            {/* RÉSUMÉ DU PANIER */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-light">
                    Nombre total d'articles : <span className="text-primary">{totalQuantity}</span>
                  </p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-light">
                    Prix total: <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS - Navigation */}
            <div className="flex justify-between mt-8 space-x-4">
              {/* BOUTON RETOUR AUX PRODUITS */}
              <Link
                to="/home"
                className={primaryButtonClass}
              >
                Retour aux produits
              </Link>

              {/* BOUTON PROCÉDER AU PAIEMENT */}
              <Link
                to={isAddressIncomplete ? "#" : "/checkout"}
                className={isAddressIncomplete ? disabledButtonClass : primaryButtonClass}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (isAddressIncomplete) {
                    e.preventDefault();
                  }
                }}
                aria-disabled={isAddressIncomplete}
                tabIndex={isAddressIncomplete ? -1 : undefined}
              >
                Passer à la caisse
              </Link>
            </div>
          </>
        ) : (
          // PANIER VIDE - État vide
          <div className="text-center text-gray-600 dark:text-lighter flex flex-col items-center">
            <p className="max-w-[576px] px-2 mx-auto text-base mb-4">
              Oups... Votre panier est vide. Continuer vos achats
            </p>
            
            {/* IMAGE PANIER VIDE */}
            <img
              src={emptyCartImage}
              alt="Empty Cart"
              className="max-w-[300px] mx-auto mb-6 dark:bg-light dark:rounded-md"
            />
            <Link
              to="/home"
              className={primaryButtonClass}
            >
              Retour aux produits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}