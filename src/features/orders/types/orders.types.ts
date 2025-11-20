/**
 * TYPES ORDERS - VERSION FINALE
 * Correspondance exacte avec le backend Java
 * 
 * @location src/features/orders/types/orders.types.ts
 */

// ============================================
// TYPES POUR LES REQUÊTES (Frontend → Backend)
// ============================================

/**
 * Requête de création de commande
 * Correspond à : OrderRequestDto.java
 */
export interface OrderRequest {
  totalPrice: number;
  paymentIntentId: string;  // ✅ Format: "pi_3ABC123..." (cohérent avec backend)
  paymentStatus: string;     // "succeeded", "processing", "failed", etc.
  items: OrderItemRequest[];
}

/**
 * Item dans une requête de commande
 * Correspond à : OrderItemDto.java
 */
export interface OrderItemRequest {
  productId: number;
  quantity: number;
  price: number;
}

// ============================================
// TYPES POUR LES RÉPONSES (Backend → Frontend)
// ============================================

/**
 * Réponse de commande
 * Correspond à : OrderResponseDto.java
 */
export interface OrderResponse {
  orderId: number;
  orderStatus: string;       // "CREATED", "CONFIRMED", "CANCELLED", "DELIVERED"
  totalPrice: number;
  paymentIntentId: string;   // Payment Intent ID de Stripe
  paymentStatus: string;     // "paid", "pending", "failed"
  createdAt: string;         // ISO 8601 format
  updatedAt?: string;        // ISO 8601 format (optionnel)
  items: OrderItemResponse[];
}

/**
 * Item dans une réponse de commande
 * Correspond à : OrderItemResponseDto.java
 */
export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  price: number;             // Prix unitaire
  subtotal: number;          // Prix total (price × quantity)
}

/**
 * Liste des commandes d'un utilisateur
 * Réponse de : GET /api/v1/orders/customer
 */
export interface UserOrdersResponse {
  orders: OrderResponse[];
}

// ============================================
// TYPES POUR L'AFFICHAGE FRONTEND (UI)
// ============================================

/**
 * Type enrichi pour l'affichage dans l'UI
 * Combine OrderResponse avec des données calculées
 */
export interface OrderDisplayData extends OrderResponse {
  orderNumber: string;       // Formaté : "#12345"
  statusLabel: string;       // Traduit : "En cours", "Livré", etc.
  paymentStatusLabel: string; // Traduit : "Payé", "En attente", etc.
  formattedTotal: string;    // Formaté : "99,99 €"
  formattedDate: string;     // Formaté : "24 oct. 2025"
  itemCount: number;         // Nombre total d'items
}

// ============================================
// CONSTANTES DE STATUTS
// ============================================

/**
 * Statuts de commande possibles
 * Correspond à : ApplicationConstants.java
 */
export const ORDER_STATUS = {
  CREATED: 'CREATED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  DELIVERED: 'DELIVERED',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

/**
 * Statuts de paiement possibles
 * Valeurs normalisées par le backend
 */
export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
} as const;

export type PaymentStatusType = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

/**
 * Statuts de paiement Stripe (avant normalisation)
 */
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

// ============================================
// TYPES UTILITAIRES
// ============================================

/**
 * Filtres pour les commandes
 */
export interface OrderFilters {
  status?: OrderStatusType;
  startDate?: string;
  endDate?: string;
  customerId?: number;
}

/**
 * Statistiques des commandes
 */
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

// ============================================
// TYPES POUR LA GESTION D'ERREURS
// ============================================

/**
 * Erreur de validation de commande
 */
export interface OrderValidationError {
  field: string;
  message: string;
  rejectedValue?: string | number | boolean | null;
}

/**
 * Réponse d'erreur du backend
 */
export interface OrderErrorResponse {
  success: false;
  message: string;
  errors?: OrderValidationError[];
}

// ============================================
// TYPES POUR LES ACTIONS REDUX/STATE
// ============================================

/**
 * Résultat de création de commande
 */
export interface CreateOrderResult {
  success: boolean;
  orderId?: number;
  error?: string;
  validationErrors?: OrderValidationError[];
}

/**
 * État de chargement des commandes
 */
export interface OrdersState {
  orders: OrderResponse[];
  currentOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
}

// ============================================
// TYPE GUARDS ET HELPERS
// ============================================

/**
 * Vérifie si une réponse est une erreur
 */
export function isOrderError(
  response: OrderResponse | OrderErrorResponse
): response is OrderErrorResponse {
  return 'success' in response && response.success === false;
}

/**
 * Vérifie si une commande est en attente
 */
export function isOrderPending(order: OrderResponse): boolean {
  return order.orderStatus === ORDER_STATUS.CREATED;
}

/**
 * Vérifie si une commande est payée
 */
export function isOrderPaid(order: OrderResponse): boolean {
  return order.paymentStatus === PAYMENT_STATUS.PAID;
}

/**
 * Calcule le nombre total d'items dans une commande
 */
export function getTotalItemCount(order: OrderResponse): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Formate le numéro de commande
 */
export function formatOrderNumber(orderId: number): string {
  return `#${orderId.toString().padStart(6, '0')}`;
}

/**
 * Convertit OrderResponse en OrderDisplayData
 */
export function toOrderDisplayData(
  order: OrderResponse,
  locale: string = 'fr-FR'
): OrderDisplayData {
  return {
    ...order,
    orderNumber: formatOrderNumber(order.orderId),
    statusLabel: getOrderStatusLabel(order.orderStatus, locale),
    paymentStatusLabel: getPaymentStatusLabel(order.paymentStatus, locale),
    formattedTotal: formatPrice(order.totalPrice, locale),
    formattedDate: formatDate(order.createdAt, locale),
    itemCount: getTotalItemCount(order),
  };
}

/**
 * Traduit le statut de commande
 */
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

/**
 * Traduit le statut de paiement
 */
export function getPaymentStatusLabel(
  status: string,
  locale: string = 'fr-FR'
): string {
  const labels: Record<string, Record<string, string>> = {
    'fr-FR': {
      [PAYMENT_STATUS.PAID]: 'Payé',
      [PAYMENT_STATUS.PENDING]: 'En attente',
      [PAYMENT_STATUS.FAILED]: 'Échoué',
    },
    'en-US': {
      [PAYMENT_STATUS.PAID]: 'Paid',
      [PAYMENT_STATUS.PENDING]: 'Pending',
      [PAYMENT_STATUS.FAILED]: 'Failed',
    },
  };
  
  return labels[locale]?.[status] || status;
}

/**
 * Formate un prix
 */
export function formatPrice(
  price: number,
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'fr-FR' ? 'EUR' : 'USD',
  }).format(price);
}

/**
 * Formate une date
 */
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

/**
 * Vérifie si un statut de commande est valide
 */
export function isValidOrderStatus(status: string): status is OrderStatusType {
  return Object.values(ORDER_STATUS).includes(status as OrderStatusType);
}

/**
 * Vérifie si un statut de paiement est valide
 */
export function isValidPaymentStatus(status: string): status is PaymentStatusType {
  return Object.values(PAYMENT_STATUS).includes(status as PaymentStatusType);
}

/**
 * Obtient la couleur CSS selon le statut de commande
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    [ORDER_STATUS.CREATED]: 'blue',
    [ORDER_STATUS.CONFIRMED]: 'green',
    [ORDER_STATUS.CANCELLED]: 'red',
    [ORDER_STATUS.DELIVERED]: 'purple',
  };
  
  return colors[status] || 'gray';
}

/**
 * Obtient la couleur CSS selon le statut de paiement
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    [PAYMENT_STATUS.PAID]: 'green',
    [PAYMENT_STATUS.PENDING]: 'yellow',
    [PAYMENT_STATUS.FAILED]: 'red',
  };
  
  return colors[status] || 'gray';
}