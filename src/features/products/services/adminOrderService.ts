/**
 * VERSION 1.0 - PRODUCTION READY
 * 
 * @location src/features/orders/services/adminOrderService.ts
 */

import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage } from '../../../shared/types/errors.types';

// ============================================
// TYPES
// ============================================

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

// ============================================
// API METHODS
// ============================================

/**
 * ✅ Récupère toutes les commandes avec filtres
 */
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

    console.log('🔄 Fetching orders with filters:', params);

    const response = await apiClient.get<PaginatedOrdersResponse>(
      '/admin/orders',
      { params }
    );

    console.log('✅ Orders fetched:', response.data.content.length);

    return response.data;

  } catch (error: unknown) {
    console.error('❌ Error fetching orders:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Récupère une commande par ID
 */
export async function getOrderById(orderId: number): Promise<Order> {
  try {
    const response = await apiClient.get<Order>(`/admin/orders/${orderId}`);
    return response.data;

  } catch (error: unknown) {
    console.error(`❌ Error fetching order ${orderId}:`, getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Confirmer une commande (PENDING → CONFIRMED)
 */
export async function confirmOrder(orderId: number): Promise<Order> {
  try {
    console.log(`✅ Confirming order ${orderId}`);

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/confirm`
    );

    console.log('✅ Order confirmed');

    return response.data;

  } catch (error: unknown) {
    console.error(`❌ Error confirming order ${orderId}:`, getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Annuler une commande
 */
export async function cancelOrder(
  orderId: number,
  reason?: string
): Promise<Order> {
  try {
    console.log(`❌ Cancelling order ${orderId}`, reason ? `Reason: ${reason}` : '');

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/cancel`,
      { reason }
    );

    console.log('✅ Order cancelled');

    return response.data;

  } catch (error: unknown) {
    console.error(`❌ Error cancelling order ${orderId}:`, getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Changer le statut d'une commande
 */
export async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus
): Promise<Order> {
  try {
    console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/status`,
      { status: newStatus }
    );

    console.log('✅ Order status updated');

    return response.data;

  } catch (error: unknown) {
    console.error(`❌ Error updating order status:`, getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Marquer comme expédiée avec numéro de suivi
 */
export async function shipOrder(
  orderId: number,
  trackingNumber?: string
): Promise<Order> {
  try {
    console.log(`🚚 Shipping order ${orderId}`);

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/ship`,
      { trackingNumber }
    );

    console.log('✅ Order shipped');

    return response.data;

  } catch (error: unknown) {
    console.error(`❌ Error shipping order:`, getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Marquer comme livrée
 */
export async function deliverOrder(orderId: number): Promise<Order> {
  try {
    console.log(`📦 Delivering order ${orderId}`);

    const response = await apiClient.patch<Order>(
      `/admin/orders/${orderId}/deliver`
    );

    console.log('✅ Order delivered');

    return response.data;

  } catch (error: unknown) {
    console.error(`❌ Error delivering order:`, getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Récupérer les statistiques des commandes
 */
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
    const response = await apiClient.get('/admin/orders/stats');
    return response.data;

  } catch (error: unknown) {
    console.error('❌ Error fetching order stats:', getErrorMessage(error));
    throw new Error(getErrorMessage(error));
  }
}

/**
 * ✅ Exporter les commandes en CSV
 */
export async function exportOrders(filters: OrderFilters): Promise<Blob> {
  try {
    const params: Record<string, string> = {};

    if (filters.status) params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const response = await apiClient.get('/admin/orders/export', {
      params,
      responseType: 'blob'
    });

    return response.data;

  } catch (error: unknown) {
    console.error('❌ Error exporting orders:', getErrorMessage(error));
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