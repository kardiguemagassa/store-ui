/**
 * @location src/features/orders/services/adminOrderService.ts
 */

import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage, logger } from '../../../shared/types/errors.types';

// TYPES
export type OrderStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "PROCESSING" 
  | "SHIPPED" 
  | "DELIVERED" 
  | "CANCELLED";

export interface Order {
  orderId: number;
  orderNumber: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
  shippingAddress?: Address;
  paymentMethod?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface PaginatedOrdersResponse {
  content: Order[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface OrderFilters {
  page: number;
  size: number;
  status?: OrderStatus;
  query?: string;
  startDate?: string;
  endDate?: string;
}

// API METHODS

// Récupère toutes les commandes avec filtres
export async function getAllOrders(
  filters: OrderFilters
): Promise<PaginatedOrdersResponse> {
  try {
    const params: Record<string, string> = {
      page: filters.page.toString(),
      size: filters.size.toString()
    };

    if (filters.status) params.status = filters.status;
    if (filters.query) params.query = filters.query;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    logger.debug("Récupération commandes avec filtres", "AdminOrderService", {
      page: filters.page,
      size: filters.size,
      hasStatus: !!filters.status,
      hasQuery: !!filters.query,
      hasDateRange: !!(filters.startDate || filters.endDate)
    });

    const response = await apiClient.get<PaginatedOrdersResponse>(
      '/admin/orders',
      { params }
    );

    logger.debug("Commandes récupérées avec succès", "AdminOrderService", {
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      currentPage: response.data.number,
      contentLength: response.data.content?.length || 0
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur récupération commandes", "AdminOrderService", error, {
      page: filters.page,
      status: filters.status
    });
    throw new Error(getErrorMessage(error));
  }
}

// Récupère une commande par ID
export async function getOrderById(orderId: number): Promise<Order> {
  try {
    logger.debug("Récupération commande par ID", "AdminOrderService", { orderId });
    
    const response = await apiClient.get<Order>(`/admin/orders/${orderId}`);
    
    logger.debug("Commande récupérée avec succès", "AdminOrderService", {
      orderId,
      orderNumber: response.data.orderNumber,
      status: response.data.status
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur récupération commande", "AdminOrderService", error, { orderId });
    throw new Error(getErrorMessage(error));
  }
}

// Confirmer une commande (PENDING → CONFIRMED)
export async function confirmOrder(orderId: number): Promise<Order> {
  try {
    logger.info("Confirmation commande", "AdminOrderService", { orderId });

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/confirm`
    );

    logger.info("Commande confirmée avec succès", "AdminOrderService", {
      orderId,
      newStatus: response.data.status
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur confirmation commande", "AdminOrderService", error, { orderId });
    throw new Error(getErrorMessage(error));
  }
}

// Annuler une commande
export async function cancelOrder(
  orderId: number,
  reason?: string
): Promise<Order> {
  try {
    logger.info("Annulation commande", "AdminOrderService", {
      orderId,
      hasReason: !!reason
    });

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/cancel`,
      { reason }
    );

    logger.info("Commande annulée avec succès", "AdminOrderService", {
      orderId,
      newStatus: response.data.status
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur annulation commande", "AdminOrderService", error, { orderId });
    throw new Error(getErrorMessage(error));
  }
}

// Changer le statut d'une commande
export async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus
): Promise<Order> {
  try {
    logger.info("Mise à jour statut commande", "AdminOrderService", {
      orderId,
      newStatus
    });

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/status`,
      { status: newStatus }
    );

    logger.info("Statut commande mis à jour avec succès", "AdminOrderService", {
      orderId,
      newStatus: response.data.status
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur mise à jour statut commande", "AdminOrderService", error, {
      orderId,
      newStatus
    });
    throw new Error(getErrorMessage(error));
  }
}

//  Marquer comme expédiée avec numéro de suivi
export async function shipOrder(
  orderId: number,
  trackingNumber?: string
): Promise<Order> {
  try {
    logger.info("Expédition commande", "AdminOrderService", {
      orderId,
      hasTrackingNumber: !!trackingNumber
    });

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/ship`,
      { trackingNumber }
    );

    logger.info("Commande expédiée avec succès", "AdminOrderService", {
      orderId,
      newStatus: response.data.status
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur expédition commande", "AdminOrderService", error, { orderId });
    throw new Error(getErrorMessage(error));
  }
}

// Marquer comme livrée
export async function deliverOrder(orderId: number): Promise<Order> {
  try {
    logger.info("Livraison commande", "AdminOrderService", { orderId });

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/deliver`
    );

    logger.info("Commande livrée avec succès", "AdminOrderService", {
      orderId,
      newStatus: response.data.status
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur livraison commande", "AdminOrderService", error, { orderId });
    throw new Error(getErrorMessage(error));
  }
}

// Récupérer les statistiques des commandes
export async function getOrderStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  todayRevenue: number;
  monthRevenue: number;
}> {
  try {
    logger.debug("Récupération statistiques commandes", "AdminOrderService");
    
    const response = await apiClient.get('/admin/orders/stats');
    
    logger.debug("Statistiques commandes récupérées", "AdminOrderService", {
      total: response.data.total,
      pending: response.data.pending,
      delivered: response.data.delivered
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur récupération statistiques commandes", "AdminOrderService", error);
    throw new Error(getErrorMessage(error));
  }
}

// Exporter les commandes en CSV
export async function exportOrders(filters: OrderFilters): Promise<Blob> {
  try {
    const params: Record<string, string> = {};

    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    logger.info("Export commandes CSV", "AdminOrderService", {
      hasStatus: !!filters.status,
      hasDateRange: !!(filters.startDate || filters.endDate)
    });

    const response = await apiClient.get('/admin/orders/export', {
      params,
      responseType: 'blob'
    });

    logger.info("Export commandes CSV réussi", "AdminOrderService", {
      blobSize: response.data.size
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur export commandes CSV", "AdminOrderService", error, {
      status: filters.status
    });
    throw new Error(getErrorMessage(error));
  }
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

const adminOrderService = {
  getAllOrders,
  getOrderById,
  confirmOrder,
  cancelOrder,
  updateOrderStatus,
  shipOrder,
  deliverOrder,
  getOrderStats,
  exportOrders
};

export default adminOrderService;