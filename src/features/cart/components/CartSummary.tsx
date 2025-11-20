import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/cartHelpers';

interface CartSummaryProps {
  totalQuantity: number;
  totalPrice: number;
  isAddressIncomplete: boolean;
}

export default function CartSummary({
  totalQuantity,
  totalPrice,
  isAddressIncomplete
}: CartSummaryProps) {
  
  // STYLES
  const buttonBaseClass = "py-2 px-4 text-xl font-semibold rounded-sm flex justify-center items-center transition";
  const primaryButtonClass = `${buttonBaseClass} bg-primary dark:bg-light text-white dark:text-black hover:bg-dark dark:hover:bg-lighter`;
  const disabledButtonClass = `${buttonBaseClass} bg-gray-400 cursor-not-allowed text-white dark:text-black`;

  return (
    <>
      {/* AVERTISSEMENT ADRESSE INCOMPLÈTE */}
      {isAddressIncomplete && (
        <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-200 text-lg text-center">
            Veuillez mettre à jour votre adresse dans votre profil pour procéder au paiement.
          </p>
        </div>
      )}

      {/* RÉSUMÉ DU PANIER */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-gray-800 dark:text-light">
              Nombre total d'articles : <span className="text-primary">{totalQuantity}</span>
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-light">
              Prix total: <span className="text-primary">{formatPrice(totalPrice)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS - NAVIGATION */}
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
  );
}