// Types pour les commandes
export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  name?: string;
  imageUrl?: string;
}

export interface OrderRequest {
  totalPrice: number;
  paymentId: string;
  paymentStatus: string;
  items: OrderItem[];
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
}

export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderCustomer {
  customerId: number;
  name: string;
  email: string;
  mobileNumber: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderStatus {
  PENDING: 'PENDING';
  PROCESSING: 'PROCESSING';
  SHIPPED: 'SHIPPED';
  DELIVERED: 'DELIVERED';
  CANCELLED: 'CANCELLED';
}

export interface PaymentStatus {
  PENDING: 'PENDING';
  SUCCEEDED: 'SUCCEEDED';
  FAILED: 'FAILED';
  REFUNDED: 'REFUNDED';
}

// Pour les requêtes de filtrage/statistiques
export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  customerId?: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}