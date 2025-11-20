import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../auth/hooks/redux";
import { 
  removeFromCart, 
  updateQuantity, 
  selectCartItems,
  selectTotalPrice 
} from "../store/cartSlice";
import { formatPrice, validateQuantity } from "../utils/cartHelpers";
import { IMAGES_CONFIG, handleImageError } from "../../../shared/constants/images";

export default function CartTable() {
  
  const dispatch = useAppDispatch(); 
  const cart = useAppSelector(selectCartItems); 
  const subtotal = useAppSelector(selectTotalPrice);

  // Met à jour la quantité d'un article
  const updateCartQuantity = (productId: number, quantity: number): void => {
    const validQuantity = validateQuantity(quantity);
    
    if (validQuantity > 0) {
      dispatch(updateQuantity({ productId, quantity: validQuantity }));
    } else {
      dispatch(removeFromCart({ productId }));
    }
  };

  // Supprime un article du panier
  const handleRemoveFromCart = (productId: number): void => {
    dispatch(removeFromCart({ productId }));
  };

  return (
    <div className="min-h-80 max-w-4xl mx-auto my-8 w-full font-primary">
      <table className="w-full">
        
        {/* EN-TÊTE */}
        <thead>
          <tr className="uppercase text-sm text-primary dark:text-light border-b border-primary dark:border-light">
            <th className="px-6 py-4">Produit</th>
            <th className="px-6 py-4">Quantité</th>
            <th className="px-6 py-4">Prix</th>
            <th className="px-6 py-4">Retirer</th>
          </tr>
        </thead>
        
        {/* CORPS */}
        <tbody className="divide-y divide-primary dark:divide-light">
          
          {/* ARTICLES */}
          {cart.map((item) => {
            // SOLUTION: Gérer le cas imageUrl null/undefined
            const imageUrl = IMAGES_CONFIG.getProductImage(item.imageUrl ?? undefined);
            
            return (
              <tr
                key={item.productId}
                className="text-sm sm:text-base text-primary dark:text-light text-center"
              >
                
                {/* PRODUIT (image + nom) */}
                <td className="px-4 sm:px-6 py-4">
                  <Link
                    to={`/products/${item.productId}`}
                    className="flex items-center"
                  >
                    <img
                      src={imageUrl}
                      alt={item.name}
                      loading="lazy"
                      onError={handleImageError} // Fallback automatique
                      className="w-16 h-16 rounded-md object-cover mr-4 hover:scale-110 transition-transform"
                    />
                    <span className="text-primary dark:text-light hover:underline">
                      {item.name}
                    </span>
                  </Link>
                </td>
                
                {/* QUANTITÉ */}
                <td className="px-4 sm:px-6 py-4">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="99"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      updateCartQuantity(item.productId, value);
                    }}
                    className="w-16 px-2 py-1 border rounded-md focus:ring focus:ring-light dark:focus:ring-gray-600 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </td>
                
                {/* PRIX */}
                <td className="px-4 sm:px-6 py-4 text-base font-light">
                  {formatPrice(item.price)}
                </td>
                
                {/* BOUTON SUPPRIMER */}
                <td className="px-4 sm:px-6 py-4">
                  <button
                    aria-label="Supprimer l'article"
                    onClick={() => handleRemoveFromCart(item.productId)}
                    className="text-primary dark:text-red-400 border border-primary dark:border-red-400 p-2 rounded hover:bg-lighter dark:hover:bg-gray-700 transition"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </td>
              </tr>
            );
          })}
          
          {/* LIGNE TOTAL */}
          {cart.length > 0 && (
            <tr className="text-center">
              <td></td>
              <td className="text-base text-gray-600 dark:text-gray-300 font-semibold uppercase px-4 sm:px-6 py-4">
                Total
              </td>
              <td className="text-lg text-primary dark:text-blue-400 font-medium px-4 sm:px-6 py-4">
                {formatPrice(subtotal)}
              </td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * ✅ CHANGEMENTS v3.0:
 * 
 * 1. Import IMAGES_CONFIG et handleImageError ✅
 * 2. Conversion imageUrl avec nullish coalescing (??) ✅
 * 3. getProductImage() retourne toujours string ✅
 * 4. Fallback automatique sur erreur image ✅
 * 5. Type safety complet
 * 
 * POURQUOI ?? AU LIEU DE || :
 * 
 * item.imageUrl ?? undefined
 * - Si imageUrl est null → undefined
 * - Si imageUrl est undefined → undefined
 * - Si imageUrl est "" → "" (string vide conservée)
 * 
 * item.imageUrl || undefined
 * - Si imageUrl est "" → undefined (problématique car "" est falsy)
 * 
 * FLOW DES IMAGES:
 * 
 * 1. item.imageUrl (string | null | undefined)
 * 2. ?? undefined (normalise null → undefined)
 * 3. IMAGES_CONFIG.getProductImage(...)
 * 4. → string (toujours !)
 * 5. img src={imageUrl} (React accepte)
 */