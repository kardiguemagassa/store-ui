import apiClient from '../../../shared/api/apiClient';
import type { PaymentIntent } from '@stripe/stripe-js';
import type {
  CreateOrderResult,
  OrderFilters,
  OrderRequest,
  OrderResponse,
  OrderStatusType,
  OrderStats,
  PaginatedOrdersResponse
} from '../types/orders.types';
import { ORDER_STATUS } from '../types/orders.types';
import { getErrorMessage, logger } from '../../../shared/types/errors.types';
import type { CartItem } from '../../payment/types/payment.pytes';

// Wrapper de l'API Response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

// COMMANDES CLIENT
export async function createOrder(
  totalPrice: number,
  paymentIntent: PaymentIntent,
  cart: CartItem[]
): Promise<CreateOrderResult> {
  try {
    logger.info('Création de commande', 'createOrder', {
      totalPrice,
      paymentIntentId: paymentIntent.id,
      itemsCount: cart.length
    });

    const orderData: OrderRequest = {
      totalPrice,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
      items: cart.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    const response = await apiClient.post<ApiResponse<{ orderId: number }>>('/orders', orderData);

    logger.info('Commande créée avec succès', 'createOrder', {
      orderId: response.data.data.orderId
    });

    return {
      success: true,
      orderId: response.data.data.orderId
    };

  } catch (error: unknown) {
    logger.error('Erreur lors de la création de commande', 'createOrder', error);
    
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

export async function getMyOrdersPaginated(filters?: OrderFilters): Promise<PaginatedOrdersResponse> {
  try {
    logger.info('Récupération des commandes paginées', 'getMyOrdersPaginated', { filters });

    const params: Record<string, string> = {
      page: filters?.page?.toString() || '0',
      size: filters?.size?.toString() || '10'
    };

    if (filters?.status) params.status = filters.status;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.sortDirection) params.sortDirection = filters.sortDirection;

    const response = await apiClient.get<PaginatedOrdersResponse>(
      '/orders/customer/paginated',
      { params }
    );

    logger.info('Commandes paginées récupérées', 'getMyOrdersPaginated', {
      page: response.data.number,
      size: response.data.size,
      total: response.data.totalElements,
      items: response.data.content.length
    });

    return response.data;

  } catch (error: unknown) {
    logger.error('Erreur lors de la récupération des commandes paginées', 'getMyOrdersPaginated', error);
    throw error;
  }
}

export async function getMyOrders(): Promise<OrderResponse[]> {
  try {
    logger.info('Récupération des commandes client', 'getMyOrders');
    
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>('/orders/customer');
    
    logger.info('Commandes client récupérées', 'getMyOrders', {
      count: response.data.data.length
    });
    
    return response.data.data;
  } catch (error: unknown) {
    logger.error('Erreur lors de la récupération des commandes client', 'getMyOrders', error);
    throw error;
  }
}

export async function getOrderById(orderId: number): Promise<OrderResponse> {
  try {
    const response = await apiClient.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`);
    return response.data.data;
  } catch (error: unknown) {
    logger.error(`Erreur lors de la récupération de la commande ${orderId}`, 'getOrderById', error);
    throw error;
  }
}

// COMMANDES ADMIN
export async function getAllOrders(filters?: OrderFilters): Promise<PaginatedOrdersResponse> {
  try {
    logger.info('Récupération des commandes admin', 'getAllOrders', { filters });

    const params: Record<string, string> = {
      page: filters?.page?.toString() || '0',
      size: filters?.size?.toString() || '5'
    };

    if (filters?.status) params.status = filters.status;
    if (filters?.query) params.query = filters.query;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.sortDirection) params.sortDirection = filters.sortDirection;

    const response = await apiClient.get<PaginatedOrdersResponse>('/orders/admin/paginated', { params });

    logger.info('Commandes admin récupérées', 'getAllOrders', {
      page: response.data.number,
      size: response.data.size,
      total: response.data.totalElements,
      items: response.data.content.length
    });

    return response.data;

  } catch (error: unknown) {
    logger.error('Erreur lors de la récupération des commandes admin', 'getAllOrders', error);
    throw error;
  }
}

export async function confirmOrder(orderId: number): Promise<void> {
  try {
    logger.info(`Confirmation de la commande ${orderId}`, 'confirmOrder');
    
    await apiClient.patch(`/orders/admin/${orderId}/confirm`); 
    
    logger.info(`Commande ${orderId} confirmée`, 'confirmOrder');
  } catch (error: unknown) {
    logger.error(`Erreur lors de la confirmation de la commande ${orderId}`, 'confirmOrder', error);
    throw error;
  }
}

export async function cancelOrder(orderId: number, reason?: string): Promise<void> {
  try {
    logger.info(`Annulation de la commande ${orderId}`, 'cancelOrder', { reason });
    
    await apiClient.patch(`/orders/admin/${orderId}/cancel`, { reason });
    
    logger.info(`Commande ${orderId} annulée`, 'cancelOrder');
  } catch (error: unknown) {
    logger.error(`Erreur lors de l'annulation de la commande ${orderId}`, 'cancelOrder', error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatusType
): Promise<void> {
  try {
    logger.info(`Mise à jour du statut de la commande ${orderId}`, 'updateOrderStatus', { status });
    
    await apiClient.patch(`/orders/admin/${orderId}/status`, null, {
      params: { status }
    });
    
    logger.info(`Statut de la commande ${orderId} mis à jour`, 'updateOrderStatus');
  } catch (error: unknown) {
    logger.error(`Erreur lors de la mise à jour du statut de la commande ${orderId}`, 'updateOrderStatus', error);
    throw error;
  }
}

// STATISTIQUES
export async function getOrderStats(): Promise<OrderStats> {
  try {
    const response = await getAllOrders();

    const stats: OrderStats = {
      totalOrders: response.totalElements,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0
    };

    response.content.forEach(order => {
      if (order.orderStatus === ORDER_STATUS.CREATED) {
        stats.pendingOrders++;
      }

      if (order.orderStatus === ORDER_STATUS.DELIVERED) {
        stats.deliveredOrders++;
      }

      if (order.orderStatus !== ORDER_STATUS.CANCELLED) {
        stats.totalRevenue += order.totalPrice || 0;
      }
    });

    return stats;

  } catch (error: unknown) {
    logger.error('Erreur lors de la récupération des statistiques de commande', 'getOrderStats', error);
    throw error;
  }
}

export async function getOrdersByStatus(status: OrderStatusType): Promise<OrderResponse[]> {
  try {
    const response = await getAllOrders({ 
      status,
      query: '',
      page: 0,
      size: 1000
    });
    return response.content;
  } catch (error: unknown) {
    logger.error(`Erreur lors de la récupération des commandes avec le statut ${status}`, 'getOrdersByStatus', error);
    throw error;
  }
}

// LOADERS (pour React Router)
export async function ordersLoader(): Promise<OrderResponse[]> {
  try {
    logger.info("Chargement des commandes client", "ordersLoader");
    
    const response = await apiClient.get<OrderResponse[]>("/orders/customer");
    
    const orders = Array.isArray(response.data) ? response.data : [];
    
    logger.info("Commandes client chargées", "ordersLoader", {
      count: orders.length
    });
    
    return orders;
  } catch (error: unknown) {
    logger.error("Échec du chargement des commandes client", "ordersLoader", error);
    const errorMessage = getErrorMessage(error);
    const status = (error as { response?: { status: number } })?.response?.status || 500;
    throw new Response(errorMessage, { status });
  }
}

export async function customerOrdersPaginatedLoader({ request }: { request: Request }): Promise<PaginatedOrdersResponse> {
  try {
    logger.info("Chargement des commandes client paginées", "customerOrdersPaginatedLoader");
    
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '0';
    const size = url.searchParams.get('size') || '5';
    const status = url.searchParams.get('status');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortDirection = url.searchParams.get('sortDirection') || 'DESC';

    const filters: OrderFilters = {
      page: parseInt(page),
      size: parseInt(size),
      sortBy,
      sortDirection: sortDirection as 'ASC' | 'DESC'
    };

    if (status) filters.status = status as OrderStatusType;

    const response = await getMyOrdersPaginated(filters);
    
    logger.info("Commandes client paginées chargées", "customerOrdersPaginatedLoader", {
      page: response.number,
      size: response.size,
      total: response.totalElements,
      items: response.content.length
    });
    
    return response;

  } catch (error: unknown) {
    logger.error("Échec du chargement des commandes client paginées", "customerOrdersPaginatedLoader", error);
    const errorMessage = getErrorMessage(error);
    const status = (error as { response?: { status: number } })?.response?.status || 500;
    throw new Response(errorMessage, { status });
  }
}

export async function adminOrdersLoader(): Promise<OrderResponse[]> {
  try {
    logger.info("Chargement des commandes admin", "adminOrdersLoader");
    
    const response = await apiClient.get<PaginatedOrdersResponse>("/orders/admin/paginated", {
      params: {
        page: '0',
        size: '10'
      }
    });

    const orders = response.data.content || [];
    
    logger.info("Commandes admin chargées", "adminOrdersLoader", {
      count: orders.length
    });
    
    return orders;

  } catch (error: unknown) {
    logger.error("Échec du chargement des commandes admin", "adminOrdersLoader", error);
    const errorMessage = getErrorMessage(error);
    const status = (error as { response?: { status: number } })?.response?.status || 500;
    throw new Response(errorMessage, { status });
  }
}

export async function orderByIdLoader(orderId: number): Promise<OrderResponse> {
  try {
    logger.info(`Chargement de la commande ${orderId}`, "orderByIdLoader");
    
    const response = await apiClient.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`);
    
    logger.info(`Commande ${orderId} chargée`, "orderByIdLoader");
    
    return response.data.data;
  } catch (error: unknown) {
    logger.error(`Échec du chargement de la commande ${orderId}`, "orderByIdLoader", error);
    const errorMessage = getErrorMessage(error);
    const status = (error as { response?: { status: number } })?.response?.status || 500;
    throw new Response(errorMessage, { status });
  }
}

// HELPERS
export function canBeCancelled(order: OrderResponse): boolean {
  const cancelableStatuses: OrderStatusType[] = [
    ORDER_STATUS.CREATED,
    ORDER_STATUS.CONFIRMED
  ];
  return cancelableStatuses.includes(order.orderStatus as OrderStatusType);
}

export function canBeConfirmed(order: OrderResponse): boolean {
  return order.orderStatus === ORDER_STATUS.CREATED;
}

export function calculateOrderTotal(order: OrderResponse): number {
  return order.items?.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0) || order.totalPrice || 0;
}

export default {
  // Client
  createOrder,
  getMyOrders,
  getMyOrdersPaginated, 
  getOrderById,
  
  // Admin
  getAllOrders,
  confirmOrder,
  cancelOrder,
  updateOrderStatus,
  
  // Stats
  getOrderStats,
  getOrdersByStatus,
  
  // Loaders
  ordersLoader,
  customerOrdersPaginatedLoader,
  adminOrdersLoader,
  orderByIdLoader,
  
  // Helpers
  canBeCancelled,
  canBeConfirmed,
  calculateOrderTotal
};