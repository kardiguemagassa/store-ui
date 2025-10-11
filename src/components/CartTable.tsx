import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { 
  removeFromCart, 
  updateQuantity, 
  selectCartItems,
  selectTotalPrice 
} from "../store/cartSlice"; 

export default function CartTable() {
  
  const dispatch = useAppDispatch(); 
  const cart = useAppSelector(selectCartItems); 
  const subtotal = useAppSelector(selectTotalPrice); // Calcul du total via sélecteur

  // Typage explicite des paramètres
  const updateCartQuantity = (productId: number, quantity: number): void => {
    if (quantity > 0) {
      // Utilisation de l'action updateQuantity
      dispatch(updateQuantity({ productId, quantity }));
    } else {
      // Si quantité = 0, supprimer l'article
      dispatch(removeFromCart({ productId }));
    }
  };

  const handleRemoveFromCart = (productId: number): void => {
    dispatch(removeFromCart({ productId })); // Dispatch de l'action
  };

  return (
    <div className="min-h-80 max-w-4xl mx-auto my-8 w-full font-primary">
      <table className="w-full">
        <thead>
          <tr className="uppercase text-sm text-primary dark:text-light border-b border-primary dark:border-light">
            <th className="px-6 py-4">Produit</th>
            <th className="px-6 py-4">Quantité</th>
            <th className="px-6 py-4">Prix</th>
            <th className="px-6 py-4">Retirer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary dark:divide-light">
          {cart.map((item) => (
            <tr
              key={item.productId}
              className="text-sm sm:text-base text-primary dark:text-light text-center"
            >
              <td className="px-4 sm:px-6 py-4 flex items-center">
                <Link
                  to={`/products/${item.productId}`}
                  className="flex items-center"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover mr-4 hover:scale-110 transition-transform"
                  />
                  <span className="text-primary dark:text-light hover:underline">
                    {item.name}
                  </span>
                </Link>
              </td>
              <td className="px-4 sm:px-6 py-4">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    updateCartQuantity(item.productId, value > 0 ? value : 1);
                  }}
                  className="w-16 px-2 py-1 border rounded-md focus:ring focus:ring-light dark:focus:ring-gray-600 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </td>
              <td className="px-4 sm:px-6 py-4 text-base font-light">
                ${item.price.toFixed(2)}
              </td>
              <td className="px-4 sm:px-6 py-4">
                <button
                  aria-label="delete-item"
                  onClick={() => handleRemoveFromCart(item.productId)} // Nouvelle fonction
                  className="text-primary dark:text-red-400 border border-primary dark:border-red-400 p-2 rounded hover:bg-lighter dark:hover:bg-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </td>
            </tr>
          ))}
          {cart.length > 0 && (
            <tr className="text-center">
              <td></td>
              <td className="text-base text-gray-600 dark:text-gray-300 font-semibold uppercase px-4 sm:px-6 py-4">
                Total
              </td>
              <td className="text-lg text-primary dark:text-blue-400 font-medium px-4 sm:px-6 py-4">
                ${subtotal.toFixed(2)} {/* Utilisation du subtotal du sélecteur */}
              </td>
              <td></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}