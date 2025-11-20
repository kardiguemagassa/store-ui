import { useState, useEffect, useCallback } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../../shared/api/apiClient";
import PageTitle from "../../../shared/components/PageTitle";
import Pagination from "../../../shared/components/Pagination";
import { handleImageError, IMAGES_CONFIG } from "../../../shared/constants/images";
import { getErrorMessage } from "../../../shared/types/errors.types";
import { 
  formatDate, 
  formatOrderNumber, 
  formatPrice, 
  getPaymentStatusColor, 
  getPaymentStatusLabel, 
  type OrderItemResponse, 
  type OrderResponse 
} from "../types/orders.types";

// ============================================
// TYPES POUR LA FONCTIONNALITÉ AVANCÉE
// ============================================

type OrderStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "PROCESSING" 
  | "SHIPPED" 
  | "DELIVERED" 
  | "CANCELLED";

interface OrderFilters {
  page: number;
  size: number;
  status?: OrderStatus;
  query?: string;
}

interface PaginatedOrdersResponse {
  content: OrderResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ============================================
// CONFIGURATION DES STATUTS AVANCÉS
// ============================================

const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  emoji: string;
  nextAction?: { label: string; status: OrderStatus };
}> = {
  PENDING: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    emoji: "⏳",
    nextAction: { label: "Confirmer", status: "CONFIRMED" }
  },
  CONFIRMED: {
    label: "Confirmée",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    emoji: "✅",
    nextAction: { label: "Traiter", status: "PROCESSING" }
  },
  PROCESSING: {
    label: "En préparation",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100",
    emoji: "📦",
    nextAction: { label: "Expédier", status: "SHIPPED" }
  },
  SHIPPED: {
    label: "Expédiée",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
    emoji: "🚚",
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

// ============================================
// COMPOSANT PRINCIPAL CORRIGÉ
// ============================================

export default function AdminOrders() {
  const loaderData = useLoaderData();
  const revalidator = useRevalidator();

  // État pour la gestion avancée
  const [filters, setFilters] = useState<OrderFilters>({
    page: 0,
    size: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0
  });

  // Validation et typage des commandes
  const orders: OrderResponse[] = (() => {
    if (!loaderData || !Array.isArray(loaderData)) return [];
    return loaderData.filter((order): order is OrderResponse =>
      order && typeof order === 'object' && 'orderId' in order
    );
  })();

  // Chargement des commandes avec filtres
  const loadOrders = useCallback(async () => {
    try {
      const params: Record<string, string> = {
        page: filters.page.toString(),
        size: filters.size.toString()
      };

      if (filters.status) params.status = filters.status;
      if (filters.query) params.query = filters.query;

      const response = await apiClient.get<PaginatedOrdersResponse>(
        "/admin/orders",
        { params }
      );

      setPagination({
        currentPage: response.data.number,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements
      });

    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  }, [filters]);

  // ✅ CORRECTION: Supprimé handleConfirm et handleCancel inutilisés
  // et conservé seulement les nouvelles fonctions

  // NOUVELLES FONCTIONNALITÉS AVANCÉES
  const handleChangeStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`✅ Statut mis à jour: ${ORDER_STATUS_CONFIG[newStatus].label}`);
      revalidator.revalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleConfirmOrder = async (orderId: number) => {
    if (!window.confirm("Confirmer cette commande ?")) return;

    try {
      await apiClient.patch(`/admin/orders/${orderId}/confirm`);
      toast.success("✅ Commande confirmée avec succès");
      revalidator.revalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = window.prompt("Raison de l'annulation (optionnel) :");
    if (reason === null) return;

    try {
      await apiClient.patch(`/admin/orders/${orderId}/cancel`, { reason });
      toast.success("✅ Commande annulée");
      revalidator.revalidate();
    } catch (error: unknown) {
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

  // EFFET POUR CHARGEMENT AVEC FILTRES
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // État de chargement
  if (orders.length === 0) {
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
      
      {/* Barre de filtres avancés */}
      <FilterBar
        filters={filters}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
      />

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total commandes"
          value={orders.length}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="En attente"
          value={orders.filter(o => o.orderStatus === 'CREATED').length}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Confirmées"
          value={orders.filter(o => o.orderStatus === 'CONFIRMED').length}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Annulées"
          value={orders.filter(o => o.orderStatus === 'CANCELLED').length}
          icon="❌"
          color="red"
        />
      </div>

      {/* Liste des commandes avec nouvelles actions */}
      <div className="space-y-6">
        {orders.map((order) => (
          <EnhancedOrderCard
            key={order.orderId}
            order={order}
            onConfirm={handleConfirmOrder}
            onCancel={handleCancelOrder}
            onChangeStatus={handleChangeStatus}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPOSANTS
// ============================================

// Barre de filtres
interface FilterBarProps {
  filters: OrderFilters;
  onSearch: (query: string) => void;
  onStatusFilter: (status: OrderStatus | "") => void;
}

const FilterBar = ({ filters, onSearch, onStatusFilter }: FilterBarProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Recherche */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🔍 Rechercher
        </label>
        <input
          type="text"
          placeholder="N° de commande ou email..."
          value={filters.query || ""}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Filtre Statut */}
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

// Carte de commande améliorée
interface EnhancedOrderCardProps {
  order: OrderResponse;
  onConfirm: (orderId: number) => void;
  onCancel: (orderId: number) => void;
  onChangeStatus: (orderId: number, status: OrderStatus) => void;
}

const EnhancedOrderCard = ({ order, onConfirm, onCancel, onChangeStatus }: EnhancedOrderCardProps) => {
  // ✅ CORRECTION: Supprimé statusColor inutilisé
  const paymentColor = getPaymentStatusColor(order.paymentStatus);

  // Conversion du statut pour la nouvelle configuration
  const getMappedStatus = (status: string): OrderStatus => {
    const statusMap: Record<string, OrderStatus> = {
      'CREATED': 'PENDING',
      'CONFIRMED': 'CONFIRMED',
      'PROCESSING': 'PROCESSING',
      'SHIPPED': 'SHIPPED',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED'
    };
    return statusMap[status] || 'PENDING';
  };

  const currentStatus = getMappedStatus(order.orderStatus);
  const statusConfig = ORDER_STATUS_CONFIG[currentStatus];
  const canCancel = !["DELIVERED", "CANCELLED"].includes(currentStatus);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* En-tête améliorée */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Commande {formatOrderNumber(order.orderId)}
            </h2>
            <EnhancedStatusBadge status={currentStatus} />
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

        {/* Actions avancées */}
        <div className="flex gap-2 mt-4 lg:mt-0">
          {/* Voir détails */}
          <Link
            to={`/admin/orders/${order.orderId}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm px-3 py-2 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-50 transition"
            title="Voir les détails"
          >
            👁️
          </Link>

          {/* Confirmer (si PENDING) */}
          {currentStatus === 'PENDING' && (
            <button
              onClick={() => onConfirm(order.orderId)}
              className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm px-3 py-2 rounded border border-green-200 dark:border-green-800 hover:bg-green-50 transition"
              title="Confirmer la commande"
            >
              ✅
            </button>
          )}

          {/* Action suivante */}
          {statusConfig.nextAction && (
            <button
              onClick={() => onChangeStatus(order.orderId, statusConfig.nextAction!.status)}
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-sm px-3 py-2 rounded border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 transition"
              title={statusConfig.nextAction.label}
            >
              ➡️
            </button>
          )}

          {/* Annuler */}
          {canCancel && (
            <button
              onClick={() => onCancel(order.orderId)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm px-3 py-2 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 transition"
              title="Annuler la commande"
            >
              ❌
            </button>
          )}
        </div>
      </div>

      {/* Articles de la commande */}
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

// Badge de statut amélioré
const EnhancedStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = ORDER_STATUS_CONFIG[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${config.color}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
};

// ============================================
// COMPOSANTS EXISTANTS
// ============================================

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