export interface OrderRequest {
  totalPrice: number;
  paymentIntentId: string;
  paymentStatus: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  orderId: number;
  orderStatus: string;
  totalPrice: number;
  paymentIntentId: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt?: string;
  customerEmail: string;
  customerName: string;
  items: OrderItemResponse[];
  
  // Champs calculés du backend
  totalItemQuantity?: number;
  totalItems?: number;
  orderStatusLabel?: string;
  paymentStatusLabel?: string;
  customerDisplay?: string;
  delivered?: boolean;
  editable?: boolean;
  paid?: boolean;
  cancelled?: boolean;
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

// Interface pour la réponse paginée
export interface PaginatedOrdersResponse {
  content: OrderResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface UserOrdersResponse {
  orders: OrderResponse[];
}

export interface OrderDisplayData extends OrderResponse {
  orderNumber?: string;
  statusLabel?: string;
  paymentStatusLabel?: string;
  formattedTotal?: string;
  formattedDate?: string;
  itemCount?: number;
}

// CONSTANTES DE STATUTS
export const ORDER_STATUS = {
  CREATED: 'CREATED',
  CONFIRMED: 'CONFIRMED', 
  CANCELLED: 'CANCELLED',
  DELIVERED: 'DELIVERED',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
  SUCCEEDED: 'succeeded',
} as const;

export type PaymentStatusType = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const STRIPE_PAYMENT_STATUS = {
  SUCCEEDED: 'succeeded',
  PROCESSING: 'processing',
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  REQUIRES_ACTION: 'requires_action',
  CANCELED: 'canceled',
  FAILED: 'failed',
} as const;

export type StripePaymentStatusType = typeof STRIPE_PAYMENT_STATUS[keyof typeof STRIPE_PAYMENT_STATUS];

// TYPES UTILITAIRES
export interface OrderFilters {
  query?: string;
  status?: OrderStatusType | string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
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

export interface OrderValidationError {
  field: string;
  message: string;
  rejectedValue?: string | number | boolean | null;
}

export interface OrderErrorResponse {
  success: false;
  message: string;
  errors?: OrderValidationError[];
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;
  validationErrors?: OrderValidationError[];
}

export interface OrdersState {
  orders: OrderResponse[];
  currentOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
}

// TYPE GUARDS ET HELPERS
export function isOrderError(
  response: OrderResponse | OrderErrorResponse
): response is OrderErrorResponse {
  return 'success' in response && response.success === false;
}

export function isOrderPending(order: OrderResponse): boolean {
  return order.orderStatus === ORDER_STATUS.CREATED;
}

export function isOrderPaid(order: OrderResponse): boolean {
  return order.paymentStatus === PAYMENT_STATUS.PAID || order.paymentStatus === PAYMENT_STATUS.SUCCEEDED;
}

export function getTotalItemCount(order: OrderResponse): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function formatOrderNumber(orderId: number): string {
  return `#${orderId.toString().padStart(6, '0')}`;
}

export function toOrderDisplayData(
  order: OrderResponse,
  locale: string = 'fr-FR'
): OrderDisplayData {
  return {
    ...order,
    orderNumber: formatOrderNumber(order.orderId),
    statusLabel: order.orderStatusLabel || getOrderStatusLabel(order.orderStatus, locale),
    paymentStatusLabel: order.paymentStatusLabel || getPaymentStatusLabel(order.paymentStatus, locale),
    formattedTotal: formatPrice(order.totalPrice, locale),
    formattedDate: formatDate(order.createdAt, locale),
    itemCount: order.totalItems || getTotalItemCount(order),
  };
}

export function getOrderStatusLabel(
  status: string,
  locale: string = 'fr-FR'
): string {
  const labels: Record<string, Record<string, string>> = {
    'fr-FR': {
      [ORDER_STATUS.CREATED]: 'En attente',
      [ORDER_STATUS.CONFIRMED]: 'Confirmée',
      [ORDER_STATUS.CANCELLED]: 'Annulée',
      [ORDER_STATUS.DELIVERED]: 'Livrée',
    },
    'en-US': {
      [ORDER_STATUS.CREATED]: 'Pending',
      [ORDER_STATUS.CONFIRMED]: 'Confirmed',
      [ORDER_STATUS.CANCELLED]: 'Cancelled',
      [ORDER_STATUS.DELIVERED]: 'Delivered',
    },
  };
  
  return labels[locale]?.[status] || status;
}

export function getPaymentStatusLabel(
  status: string,
  locale: string = 'fr-FR'
): string {
  const labels: Record<string, Record<string, string>> = {
    'fr-FR': {
      [PAYMENT_STATUS.PAID]: 'Payé',
      [PAYMENT_STATUS.PENDING]: 'En attente',
      [PAYMENT_STATUS.FAILED]: 'Échoué',
      [PAYMENT_STATUS.SUCCEEDED]: 'Réussi',
    },
    'en-US': {
      [PAYMENT_STATUS.PAID]: 'Paid',
      [PAYMENT_STATUS.PENDING]: 'Pending',
      [PAYMENT_STATUS.FAILED]: 'Failed',
      [PAYMENT_STATUS.SUCCEEDED]: 'Succeeded',
    },
  };
  
  return labels[locale]?.[status] || status;
}

export function formatPrice(
  price: number,
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'fr-FR' ? 'EUR' : 'USD',
  }).format(price);
}

export function formatDate(
  dateString: string,
  locale: string = 'fr-FR'
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isValidOrderStatus(status: string): status is OrderStatusType {
  return Object.values(ORDER_STATUS).includes(status as OrderStatusType);
}

export function isValidPaymentStatus(status: string): status is PaymentStatusType {
  return Object.values(PAYMENT_STATUS).includes(status as PaymentStatusType);
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    [ORDER_STATUS.CREATED]: 'blue',
    [ORDER_STATUS.CONFIRMED]: 'green',
    [ORDER_STATUS.CANCELLED]: 'red',
    [ORDER_STATUS.DELIVERED]: 'purple',
  };
  
  return colors[status] || 'gray';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    [PAYMENT_STATUS.PAID]: 'green',
    [PAYMENT_STATUS.PENDING]: 'yellow',
    [PAYMENT_STATUS.FAILED]: 'red',
    [PAYMENT_STATUS.SUCCEEDED]: 'green',
  };
  
  return colors[status] || 'gray';
}