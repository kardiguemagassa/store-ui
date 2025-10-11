
import { useLoaderData, useRevalidator } from "react-router-dom";
import PageTitle from "../PageTitle";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";
import type { OrderResponse, OrderItemResponse } from "../../types/orders";

export default function AdminOrders() {

  /**
   * permet d’accéder aux données chargées par le loader défini pour cette page (ou route).
   * liste de commandes que le routeur précharge avant d’afficher la page.
   */
  const loaderData = useLoaderData();

  /**
   * useRevalidator() est un hook React Router qui permet de rafraîchir 
   * les données du loader sans recharger la page.
   * ex : Quand tu confirmes ou annules une commande :
   * 1 Met à jour la commande sur le backend.
   * 2 Puis rafraîchit les données de la page (le loader est relancé).
   * 3 Donc la page se met automatiquement à jour sans rechargement complet.
   */
  const revalidator = useRevalidator();

  // commandes
  // s'assurer que loaderData contient bien un tableau d'objets valides de type OrderResponse
  const orders: OrderResponse[] = (() => {
    if (!loaderData || !Array.isArray(loaderData)) return [];
    return loaderData.filter((order): order is OrderResponse =>
      order && typeof order === 'object' && 'orderId' in order
    );
  })();

  /**
   * Formate la date reçue du backend (généralement en ISO, ex : 2025-10-10T15:22:00Z) pour l’afficher joliment
   * @param isoDate 
   * @returns 
   */
  function formatDate(isoDate: string | undefined | null): string {
    if (!isoDate) return "N/A"; // Si la date est vide ou null
    try {
      const date = new Date(isoDate); // On crée un objet Date à partir de la chaîne ISO
      return isNaN(date.getTime())
        ? "Date invalide" // Si la date n'est pas valide
        : date.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
    } catch {
      return "Erreur de date"; // Si une erreur survient
    }
  }

  function formatPrice(price: number | undefined | null): string {
    if (price == null || isNaN(price)) return "€0.00";
    return `${price.toFixed(2)} €`;
  }

  /**
   * Handle Order Confirm
   */
  const handleConfirm = async (orderId: number): Promise<void> => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/confirm`);
      toast.success("Commande confirmée.");
      revalidator.revalidate();
    } catch (error) {
      toast.error("Échec de la confirmation de la commande." + error);
      //console.error("Confirm order error:", error);
    }
  };

  /**
   * Handle Order Cancellation
   */
  const handleCancel = async (orderId: number): Promise<void> => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/cancel`);
      toast.success("Commande annulée.");
      revalidator.revalidate();
    } catch (error) {
      toast.error("Impossible d'annuler la commande.");
      console.error("Cancel order error:", error);
    }
  };

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      {orders.length === 0 ? (
        <p className="text-center text-2xl text-primary dark:text-lighter">
          Aucune commande trouvée.
        </p>
      ) : (
        <div className="space-y-6 mt-4">
          <PageTitle title="Gestion des commandes administratives" />
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white dark:bg-gray-700 shadow-md rounded-md p-6"
            >
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary dark:text-lighter">
                    Commande #{order.orderNumber || order.orderId}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Statut:{" "}
                    <span className="font-medium text-gray-800 dark:text-lighter">
                      {order.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prix total:{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {formatPrice(order.totalPrice)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date:{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {formatDate(order.createdAt)}
                    </span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-4 lg:mt-0">
                  <button
                    onClick={() => handleConfirm(order.orderId)}
                    className="px-6 py-2 text-white dark:text-dark text-md rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => handleCancel(order.orderId)}
                    className="px-6 py-2 text-white text-md rounded-md transition duration-200 bg-red-500 hover:bg-red-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 border-t pt-4">
                {order.items?.map((item: OrderItemResponse, index: number) => (
                  <div
                    key={item.orderItemId || index}
                    className="flex items-center border-b pb-4 last:border-b-0"
                  >
                    <img
                      src={item.imageUrl || item.imageUrl || "https://via.placeholder.com/64?text=No+Image"}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/64?text=No+Image";
                      }}
                    />
                    <div>
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantité: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Prix: {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}