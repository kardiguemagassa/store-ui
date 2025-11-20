import { useMemo } from "react";
import PageTitle from "../../../shared/components/PageTitle";
import { useAppSelector } from "../../auth/hooks/redux";
import { selectCartItems, selectTotalPrice, selectTotalQuantity } from "../store/cartSlice"; 
import { useAuth } from "../../auth/hooks/useAuth";
import { isAddressIncomplete, isCartEmpty } from "../utils/cartHelpers";
import EmptyCart from "../components/EmptyCart";
import CartSummary from "../components/CartSummary";
import CartTable from "../components/CartTable";

export default function Cart() {
  
  // HOOKS - REDUX & AUTH
  const cart = useAppSelector(selectCartItems); 
  const totalPrice = useAppSelector(selectTotalPrice); 
  const totalQuantity = useAppSelector(selectTotalQuantity);
  
  const { isAuthenticated, user } = useAuth();

  // MÉMOISATION
  
  // Vérification de l'adresse utilisateur
  const addressIncomplete = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return isAddressIncomplete(user);
  }, [isAuthenticated, user]);

  // Vérification du panier vide
  const cartEmpty = useMemo(() => {
    return isCartEmpty(cart);
  }, [cart]);

  
  // DEBUG (optionnel - à retirer en production)
  console.log("Cart state:", { 
    itemsCount: cart.length,
    totalPrice,
    totalQuantity,
    addressIncomplete 
  });

  // RENDER
  return (
    <div className="min-h-[852px] py-12 bg-normalbg dark:bg-darkbg font-primary">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* TITRE */}
        <PageTitle title="Votre panier" />
        
        {/* CONTENU */}
        {!cartEmpty ? (
          <>
            {/* TABLE DES ARTICLES */}
            <CartTable />

            {/* RÉSUMÉ + NAVIGATION */}
            <CartSummary
              totalQuantity={totalQuantity}
              totalPrice={totalPrice}
              isAddressIncomplete={addressIncomplete}
            />
          </>
        ) : (
          /* ÉTAT VIDE */
          <EmptyCart />
        )}
      </div>
    </div>
  );
}