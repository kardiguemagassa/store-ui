import { useLoaderData } from "react-router-dom";
import type { OrderItemResponse, OrderResponse, PaginatedOrdersResponse } from "../types/orders.types";
import PageTitle from "../../../shared/components/PageTitle";
import Pagination from "../../../shared/components/Pagination";
import { IMAGES_CONFIG, handleImageError } from "../../../shared/constants/images";
import { logger } from "../../../shared/types/errors.types";

export default function Orders() {
  const paginatedData = useLoaderData() as PaginatedOrdersResponse;

  logger.debug("Orders component loaded", "Orders", {
    hasData: !!paginatedData,
    contentLength: paginatedData?.content?.length,
    totalElements: paginatedData?.totalElements,
    currentPage: paginatedData?.number
  });

  // Vérification de la structure des données
  if (!paginatedData || !paginatedData.content) {
    logger.warn("Données paginées invalides", "Orders", { paginatedData });
    return (
      <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
        <div className="text-center">
          <PageTitle title="Mes commandes" />
          <p className="text-xl text-primary dark:text-lighter mt-8">
            Erreur de chargement des commandes.
          </p>
        </div>
      </div>
    );
  }

  const orders = paginatedData.content;
  const currentPage = paginatedData.number;
  const totalPages = paginatedData.totalPages;
  const totalElements = paginatedData.totalElements;

  function formatDate(isoDate: string | undefined | null): string {
    if (!isoDate) {
      logger.debug("Date manquante pour le formatage", "Orders");
      return "N/A";
    }
    
    try {
      const date = new Date(isoDate);
      const isValid = !isNaN(date.getTime());
      
      if (!isValid) {
        logger.warn("Date invalide détectée", "Orders", { isoDate });
      }
      
      // HEURE avec dateStyle et timeStyle
      return isValid ? date.toLocaleString('fr-FR', {
        dateStyle: 'long',      // ex: 23 novembre 2025
        timeStyle: 'short'      // ex: 10:15
      }) : "Date invalide";
    } catch (error: unknown) {
      logger.error("Erreur lors du formatage de la date", "Orders", error, { isoDate });
      return "Erreur date";
    }
  }

  function formatPrice(price: number | undefined | null): string {
    if (price == null || isNaN(price)) {
      logger.debug("Prix manquant ou invalide", "Orders", { price });
      return "0,00 €";
    }
    
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
    
    logger.debug("Prix formaté", "Orders", { original: price, formatted: formattedPrice });
    
    return formattedPrice;
  }

  const handlePageChange = (newPage: number) => {
    window.location.href = `/orders?page=${newPage}`;
  };

  if (orders.length === 0) {
    logger.info("Aucune commande à afficher", "Orders", {
      totalElements,
      currentPage
    });
    
    return (
      <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
        <div className="text-center">
          <PageTitle title="Mes commandes" />
          <div className="mt-8">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📦</div>
            <p className="text-xl text-primary dark:text-lighter">
              Aucune commande trouvée.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Vos commandes apparaîtront ici après votre premier achat.
            </p>
          </div>
        </div>
      </div>
    );
  }

  logger.debug("Affichage des commandes", "Orders", {
    ordersCount: orders.length,
    currentPage,
    totalPages,
    totalElements
  });

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      <PageTitle title="Mes commandes" />
      
      {/* Statistiques de pagination */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page <span className="font-bold">{currentPage + 1}</span> sur <span className="font-bold">{totalPages}</span>
          {' '}- Total: <span className="font-bold">{totalElements}</span> commande{totalElements > 1 ? 's' : ''}
        </p>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-6">
        {orders.map((order: OrderResponse) => (
          <div
            key={order.orderId} 
            className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary dark:text-lighter">
                Commande #{order.orderId}
              </h2>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                order.orderStatus === 'CREATED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                order.orderStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}>
                {order.orderStatus}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Statut commande:</span> {order.orderStatus}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Paiement:</span> {order.paymentStatus || "En attente"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Total:</span> {formatPrice(order.totalPrice)}
              </p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <span className="font-medium">Date:</span> {formatDate(order.createdAt)}
            </p>

            {/* Articles de la commande */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Articles commandés ({order.items?.length || 0})
              </h3>
              <div className="space-y-4">
                {order.items?.map((item: OrderItemResponse, index: number) => {
                  logger.debug("Affichage d'article de commande", "Orders", {
                    orderId: order.orderId,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity
                  });
                  
                  return (
                    <div 
                      key={item.orderItemId || `${order.orderId}-${item.productId}-${index}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <img
                        src={IMAGES_CONFIG.getProductImage(item.productImageUrl)}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-md"
                        onError={handleImageError}
                      />
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                          {item.productName}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <p><span className="font-medium">Quantité:</span> {item.quantity}</p>
                          <p><span className="font-medium">Prix unitaire:</span> {formatPrice(item.price)}</p>
                          <p><span className="font-medium">Sous-total:</span> {formatPrice(item.subtotal || (item.price || 0) * (item.quantity || 0))}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}