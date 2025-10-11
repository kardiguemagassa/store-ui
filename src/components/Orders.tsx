import { useLoaderData } from "react-router-dom";
import PageTitle from "./PageTitle";
import type { OrderResponse, OrderItemResponse } from "../types/orders";

function isValidOrder(order: unknown): order is OrderResponse {
  return (
    typeof order === 'object' &&
    order !== null &&
    'orderId' in order
  );
}

export default function Orders() {
  const loaderData = useLoaderData();

  const orders: OrderResponse[] = (() => {
    try {
      if (!loaderData || !Array.isArray(loaderData)) {
        return [];
      }
      
      return loaderData.filter(isValidOrder);
      
    } catch (error) {
      console.error("Error processing orders:", error);
      return [];
    }
  })();

  function formatDate(isoDate: string | undefined | null): string {
    if (!isoDate) return "N/A";
    try {
      const date = new Date(isoDate);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
    } catch {
      return "Date Error";
    }
  }

  function formatPrice(price: number | undefined | null): string {
    if (price == null || isNaN(price)) return "$0.00";
    return `$${price.toFixed(2)}`;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
        <div className="text-center">
          <PageTitle title="Mes commandes" />
          <p className="text-xl text-primary dark:text-lighter mt-8">
            Aucune commande trouvée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      <div className="space-y-6 mt-4">
        <PageTitle title="Mes commandes" />
        {orders.map((order) => (
          <div
            key={order.orderId} 
            className="bg-white dark:bg-gray-700 shadow-md rounded-md p-6"
          >
            <h2 className="text-xl font-semibold mb-2 text-primary dark:text-lighter">
              Commande {order.orderNumber || `ORD-${order.orderId}`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Statut: <span className="font-medium">{order.status}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paiement: <span className="font-medium">{order.paymentStatus || "En attente"}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total: <span className="font-medium">{formatPrice(order.totalPrice)}</span>
              </p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Date: <span className="font-medium">{formatDate(order.createdAt)}</span>
            </p>

            {/* Articles de la commande - CORRECTION DES CLÉS */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                L'article commandé ({order.items?.length || 0})
              </h3>
              <div className="space-y-4">
                {order.items?.map((item: OrderItemResponse, index: number) => (
                  <div 
                    key={item.orderItemId || `${order.orderId}-${item.productId}-${index}`} // Clé composite
                    className="flex items-center border-b pb-4"
                  >
                    <img
                      src={item.productImageUrl || item.productImageUrl || "https://via.placeholder.com/64?text=No+Image"}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/64?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                        {item.productName}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Quantité: {item.quantity}</p>
                        <p>Prix: {formatPrice(item.price)}</p>
                        <p>Total: {formatPrice(item.subtotal || (item.price || 0) * (item.quantity || 0))}</p>
                        <p>ID du produit: {item.productId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}