import { useState, useEffect, useCallback } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  getAllOrders, 
  confirmOrder, 
  cancelOrder, 
  updateOrderStatus, 
} from "../services/orderService";
import PageTitle from "../../../shared/components/PageTitle";
import Pagination from "../../../shared/components/Pagination";
import { handleImageError, IMAGES_CONFIG } from "../../../shared/constants/images";
import { getErrorMessage, logger } from "../../../shared/types/errors.types";
import { 
  formatDate, 
  formatOrderNumber, 
  formatPrice, 
  getPaymentStatusColor, 
  getPaymentStatusLabel, 
  type OrderItemResponse, 
  type OrderResponse,
  type OrderFilters,
  ORDER_STATUS,
  type PaginatedOrdersResponse
} from "../types/orders.types";

// TYPES POUR LA FONCTIONNALITÉ AVANCÉE
type OrderStatus = 
  | "CREATED" 
  | "CONFIRMED" 
  | "CANCELLED" 
  | "DELIVERED";

// CONFIGURATION DES STATUTS
const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  emoji: string;
  nextAction?: { label: string; status: OrderStatus };
}> = {
  CREATED: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    emoji: "⏳",
    nextAction: { label: "Confirmer", status: "CONFIRMED" }
  },
  CONFIRMED: {
    label: "Confirmée",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    emoji: "✅",
    nextAction: { label: "Livrer", status: "DELIVERED" }
  },
  DELIVERED: {
    label: "Livrée",
    color: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    emoji: "🎉"
  },
  CANCELLED: {
    label: "Annulée",
    color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    emoji: "❌"
  }
};

// COMPOSANT PRINCIPAL
export default function AdminOrders() {
  const loaderData = useLoaderData();

  // État pour la gestion des filtres et pagination
  const [filters, setFilters] = useState<OrderFilters>({
    page: 0,
    size: 2
  });

  const [paginatedData, setPaginatedData] = useState<PaginatedOrdersResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true
  });

  const [loading, setLoading] = useState(false);

  // initialisation des données du loader
  useEffect(() => {
    if (loaderData && Array.isArray(loaderData)) {
      setPaginatedData({
        content: loaderData,
        totalElements: loaderData.length,
        totalPages: Math.ceil(loaderData.length / 10),
        number: 0,
        size: 1,
        first: true,
        last: loaderData.length <= 10
      });
    }
  }, [loaderData]);

  // Chargement des commandes avec filtres
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      logger.info('Chargement des commandes avec filtres', 'AdminOrders', { filters });
      const data = await getAllOrders(filters);
      logger.info('Commandes chargées avec succès', 'AdminOrders', {
        page: data.number,
        size: data.size,
        total: data.totalElements,
        items: data.content.length
      });
      setPaginatedData(data);
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement des commandes', 'AdminOrders', error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Charger les commandes quand les filtres changent
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ACTIONS SUR LES COMMANDES
  const handleConfirmOrder = async (orderId: number) => {
    if (!window.confirm("Confirmer cette commande ?")) return;

    try {
      await confirmOrder(orderId);
      logger.info(`Commande ${orderId} confirmée`, 'AdminOrders');
      toast.success("Commande confirmée avec succès");
      loadOrders();
    } catch (error: unknown) {
      logger.error(`Erreur lors de la confirmation de la commande ${orderId}`, 'AdminOrders', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = window.prompt("Raison de l'annulation (optionnel) :");
    if (reason === null) return;

    try {
      await cancelOrder(orderId, reason);
      logger.info(`Commande ${orderId} annulée`, 'AdminOrders', { reason });
      toast.success("Commande annulée");
      loadOrders();
    } catch (error: unknown) {
      logger.error(`Erreur lors de l'annulation de la commande ${orderId}`, 'AdminOrders', error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleChangeStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      logger.info(`Statut de la commande ${orderId} mis à jour`, 'AdminOrders', { newStatus });
      toast.success(`Statut mis à jour: ${ORDER_STATUS_CONFIG[newStatus].label}`);
      loadOrders();
    } catch (error: unknown) {
      logger.error(`Erreur lors du changement de statut de la commande ${orderId}`, 'AdminOrders', error);
      toast.error(getErrorMessage(error));
    }
  };

  // HANDLERS DE FILTRES
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status: OrderStatus | "") => {
    setFilters(prev => ({ 
      ...prev, 
      page: 0, 
      status: status || undefined 
    }));
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ 
      ...prev, 
      page: 0, 
      query: query || undefined 
    }));
  };

  // RENDU
  const orders = paginatedData.content;

  if (loading) {
    return (
      <div className="min-h-screen container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
        <PageTitle title="Gestion des commandes" />
        <div className="text-center py-16">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!loading && orders.length === 0 && !filters.query && !filters.status) {
    return (
      <div className="min-h-screen container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
        <PageTitle title="Gestion des commandes" />
        <div className="text-center py-16">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📦</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
            Aucune commande trouvée
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Les commandes des clients apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      <PageTitle title="Gestion des commandes administratives" />
      
      {/* Barre de filtres */}
      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
      />

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total commandes"
          value={paginatedData.totalElements}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="En attente"
          value={orders.filter(o => o.orderStatus === ORDER_STATUS.CREATED).length}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Confirmées"
          value={orders.filter(o => o.orderStatus === ORDER_STATUS.CONFIRMED).length}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Annulées"
          value={orders.filter(o => o.orderStatus === ORDER_STATUS.CANCELLED).length}
          icon="❌"
          color="red"
        />
      </div>

      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">
            Aucune commande ne correspond aux filtres sélectionnés
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: OrderResponse) => (
            <EnhancedOrderCard
              key={order.orderId}
              order={order}
              onConfirm={handleConfirmOrder}
              onCancel={handleCancelOrder}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginatedData.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={paginatedData.number}
            totalPages={paginatedData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

// COMPOSANTS
interface FilterBarProps {
  filters: OrderFilters;
  onSearch: (query: string) => void;
  onStatusFilter: (status: OrderStatus | "") => void;
}

const FilterBar = ({ filters, onSearch, onStatusFilter }: FilterBarProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🔍 Rechercher
        </label>
        <input
          type="text"
          placeholder="N° de commande, email ou nom du client..."
          value={filters.query || ""}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📊 Statut
        </label>
        <select
          value={filters.status || ""}
          onChange={(e) => onStatusFilter(e.target.value as OrderStatus | "")}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
            <option key={status} value={status}>
              {config.emoji} {config.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

interface EnhancedOrderCardProps {
  order: OrderResponse;
  onConfirm: (orderId: number) => void;
  onCancel: (orderId: number) => void;
  onChangeStatus: (orderId: number, status: OrderStatus) => void;
}

const EnhancedOrderCard = ({ order, onConfirm, onCancel, onChangeStatus }: EnhancedOrderCardProps) => {
  const paymentColor = getPaymentStatusColor(order.paymentStatus);

  const getMappedStatus = (status: string): OrderStatus => {
    const statusMap: Record<string, OrderStatus> = {
      [ORDER_STATUS.CREATED]: 'CREATED',
      [ORDER_STATUS.CONFIRMED]: 'CONFIRMED',
      [ORDER_STATUS.DELIVERED]: 'DELIVERED',
      [ORDER_STATUS.CANCELLED]: 'CANCELLED'
    };
    return statusMap[status] || 'CREATED';
  };

  const currentStatus = getMappedStatus(order.orderStatus);
  const statusConfig = ORDER_STATUS_CONFIG[currentStatus];
  const canCancel = !["DELIVERED", "CANCELLED"].includes(currentStatus);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Commande {formatOrderNumber(order.orderId)}
            </h2>
            <EnhancedStatusBadge status={currentStatus} />
          </div>
          
          {/*AFFICHAGE DES INFOS CLIENT */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span className="font-semibold">{order.customerName || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📧</span>
              <span>{order.customerEmail || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>💳</span>
              <StatusBadge status={order.paymentStatus} color={paymentColor} />
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 lg:mt-0">
          <Link
            to={`/admin/orders/${order.orderId}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm px-3 py-2 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title="Voir les détails"
          >
            👁️
          </Link>

          {currentStatus === 'CREATED' && (
            <button
              onClick={() => onConfirm(order.orderId)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm px-3 py-2 rounded border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
              title="Confirmer la commande"
            >
              ✅
            </button>
          )}

          {statusConfig.nextAction && (
            <button
              onClick={() => onChangeStatus(order.orderId, statusConfig.nextAction!.status)}
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-sm px-3 py-2 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
              title={statusConfig.nextAction.label}
            >
              ➡️
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onCancel(order.orderId)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm px-3 py-2 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Annuler la commande"
            >
              ❌
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Articles ({order.items?.length || 0})
        </h3>
        
        <div className="space-y-4">
          {order.items?.map((item: OrderItemResponse, index: number) => (
            <OrderItem key={item.orderItemId || index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

const EnhancedStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = ORDER_STATUS_CONFIG[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'blue' | 'yellow' | 'green' | 'red';
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    green: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    red: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className={`text-4xl ${colors[color]} rounded-full w-16 h-16 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  color: string;
}

const StatusBadge = ({ status, color }: StatusBadgeProps) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    green: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    red: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  };

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${colors[color] || colors.gray}`}>
      {getPaymentStatusLabel(status) || status}
    </span>
  );
};

interface OrderItemProps {
  item: OrderItemResponse;
}

const OrderItem = ({ item }: OrderItemProps) => {
  const imageUrl = IMAGES_CONFIG.getProductImage(item.productImageUrl);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
      <img
        src={imageUrl}
        alt={item.productName}
        loading="lazy"
        onError={handleImageError}
        className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
          {item.productName}
        </h4>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
          <span>Quantité: <span className="font-semibold">{item.quantity}</span></span>
          <span>Prix unitaire: <span className="font-semibold">{formatPrice(item.price)}</span></span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {formatPrice(item.subtotal)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sous-total
        </p>
      </div>
    </div>
  );
};