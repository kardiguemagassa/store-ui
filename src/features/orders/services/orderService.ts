import apiClient from '../../../shared/api/apiClient';
import type { CartItem } from '../../../shared/types/cart';
import type { PaymentIntent } from '@stripe/stripe-js';
import type {
  CreateOrderResult,
  OrderFilters,
  OrderRequest,
  OrderResponse,
  OrderStatusType,
  OrderStats
} from '../types/orders.types';
import { ORDER_STATUS } from '../types/orders.types';
import { getErrorMessage } from '../../../shared/types/errors.types';

// COMMANDES CLIENT
export async function createOrder(
  totalPrice: number,
  paymentIntent: PaymentIntent,
  cart: CartItem[]
): Promise<CreateOrderResult> {
  try {
    console.log('📦 Creating order:', {
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

    const response = await apiClient.post<{ orderId: number }>('/orders', orderData);

    console.log('Order created:', response.data.orderId);

    return {
      success: true,
      orderId: response.data.orderId
    };

  } catch (error: unknown) {
    console.error('Error creating order:', getErrorMessage(error));
    
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

export async function getMyOrders(): Promise<OrderResponse[]> {
  try {
    console.log('Fetching my orders...');
    const response = await apiClient.get<OrderResponse[]>('/orders/customer');
    console.log('Orders fetched:', response.data.length);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching orders:', getErrorMessage(error));
    throw error;
  }
}

export async function getOrderById(orderId: number): Promise<OrderResponse> {
  try {
    const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Error fetching order ${orderId}:`, getErrorMessage(error));
    throw error;
  }
}

// COMMANDES ADMIN
export async function getAllOrders(filters?: OrderFilters): Promise<OrderResponse[]> {
  try {
    console.log('Admin fetching all orders...');

    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.customerId) params.customerId = filters.customerId.toString();

    const response = await apiClient.get<OrderResponse[]>('/admin/orders', { params });

    console.log('Admin orders fetched:', response.data.length);
    return response.data;

  } catch (error: unknown) {
    console.error('Error fetching admin orders:', getErrorMessage(error));
    throw error;
  }
}

export async function confirmOrder(orderId: number): Promise<void> {
  try {
    console.log(`Confirming order ${orderId}`);
    await apiClient.patch(`/admin/orders/${orderId}/confirm`);
    console.log('Order confirmed');
  } catch (error: unknown) {
    console.error(` Error confirming order ${orderId}:`, getErrorMessage(error));
    throw error;
  }
}

export async function cancelOrder(orderId: number): Promise<void> {
  try {
    console.log(`Cancelling order ${orderId}`);
    await apiClient.patch(`/admin/orders/${orderId}/cancel`);
    console.log('Order cancelled');
  } catch (error: unknown) {
    console.error(`Error cancelling order ${orderId}:`, getErrorMessage(error));
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatusType
): Promise<void> {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
    console.log('Order status updated');
  } catch (error: unknown) {
    console.error(`Error updating order ${orderId} status:`, getErrorMessage(error));
    throw error;
  }
}

// STATISTIQUES
export async function getOrderStats(): Promise<OrderStats> {
  try {
    const allOrders = await getAllOrders();

    const stats: OrderStats = {
      totalOrders: allOrders.length,
      totalRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0
    };

    allOrders.forEach(order => {
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
    console.error('Error fetching order stats:', getErrorMessage(error));
    throw error;
  }
}

export async function getOrdersByStatus(status: OrderStatusType): Promise<OrderResponse[]> {
  try {
    const allOrders = await getAllOrders({ status });
    return allOrders.filter(order => order.orderStatus === status);
  } catch (error: unknown) {
    console.error(`Error fetching orders with status ${status}:`, getErrorMessage(error));
    throw error;
  }
}


// LOADERS (pour React Router)
export async function ordersLoader(): Promise<OrderResponse[]> {
  try {
    console.log("[LOADER] Fetching customer orders...");
    const response = await apiClient.get<OrderResponse[]>("/orders/customer");
    console.log("[LOADER] Orders fetched:", response.data.length);
    return response.data;
  } catch (error: unknown) {
    console.error("[LOADER] Failed to fetch orders:", error);
    const errorMessage = getErrorMessage(error);
    const status = (error as { response?: { status: number } })?.response?.status || 500;
    throw new Response(errorMessage, { status });
  }
}

export async function adminOrdersLoader(): Promise<OrderResponse[]> {
  try {
    console.log("[LOADER] Fetching admin orders...");
    const response = await apiClient.get<OrderResponse[]>("/admin/orders");
    console.log("[LOADER] Admin orders fetched:", response.data.length);
    return response.data;
  } catch (error: unknown) {
    console.error("[LOADER] Failed to fetch admin orders:", error);
    const errorMessage = getErrorMessage(error);
    const status = (error as { response?: { status: number } })?.response?.status || 500;
    throw new Response(errorMessage, { status });
  }
}

export async function orderByIdLoader(orderId: number): Promise<OrderResponse> {
  try {
    console.log(`[LOADER] Fetching order ${orderId}...`);
    const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
    console.log("[LOADER] Order fetched:", response.data.orderId);
    return response.data;
  } catch (error: unknown) {
    console.error(`[LOADER] Failed to fetch order ${orderId}:`, error);
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
  adminOrdersLoader,
  orderByIdLoader,
  
  // Helpers
  canBeCancelled,
  canBeConfirmed,
  calculateOrderTotal
};