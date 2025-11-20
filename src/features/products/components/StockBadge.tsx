/**
 * STOCK BADGE COMPONENT
 * 
 * Composant réutilisable pour afficher le statut de stock d'un produit
 * avec badge coloré et emoji
 * 
 * VERSION 1.0 - PRODUCTION READY
 * 
 * @version 1.0
 * @location src/features/products/components/StockBadge.tsx
 */

import React from 'react';
import {
  getStockStatus,
  getStockLabel,
  STOCK_BADGE_COLORS,
  STOCK_BADGE_EMOJIS,
  type StockStatus
} from '../types/product.types';

// ============================================
// TYPES
// ============================================

interface StockBadgeProps {
  quantity: number;
  showEmoji?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ============================================
// COMPOSANT
// ============================================

export const StockBadge: React.FC<StockBadgeProps> = ({
  quantity,
  showEmoji = true,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const status: StockStatus = getStockStatus(quantity);
  const label = getStockLabel(quantity);
  const emoji = STOCK_BADGE_EMOJIS[status];
  const colorClass = STOCK_BADGE_COLORS[status];

  // Classes de taille
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 
        font-semibold rounded-full
        ${sizeClasses[size]}
        ${colorClass}
        ${className}
      `}
      title={`Stock: ${quantity} unité(s)`}
    >
      {showEmoji && <span>{emoji}</span>}
      {showLabel && <span>{label}</span>}
    </span>
  );
};

/**
 * ✅ Variantes du composant
 */

// Badge compact (uniquement emoji)
export const CompactStockBadge: React.FC<{ quantity: number }> = ({ quantity }) => (
  <StockBadge quantity={quantity} showLabel={false} size="sm" />
);

// Badge détaillé (emoji + label)
export const DetailedStockBadge: React.FC<{ quantity: number }> = ({ quantity }) => (
  <StockBadge quantity={quantity} showEmoji showLabel size="md" />
);

// Badge grand format
export const LargeStockBadge: React.FC<{ quantity: number }> = ({ quantity }) => (
  <StockBadge quantity={quantity} showEmoji showLabel size="lg" />
);

/**
 * ✅ Composant avec message personnalisé
 */
export const StockBadgeWithMessage: React.FC<{
  quantity: number;
  customMessages?: Partial<Record<StockStatus, string>>;
}> = ({ quantity, customMessages }) => {
  const status = getStockStatus(quantity);
  const defaultLabel = getStockLabel(quantity);
  const label = customMessages?.[status] || defaultLabel;

  return (
    <span
      className={`
        inline-flex items-center gap-1 
        text-sm px-3 py-1 font-semibold rounded-full
        ${STOCK_BADGE_COLORS[status]}
      `}
    >
      <span>{STOCK_BADGE_EMOJIS[status]}</span>
      <span>{label}</span>
    </span>
  );
};

/**
 * ✅ Composant avec alerte stock bas
 */
export const StockBadgeWithAlert: React.FC<{
  quantity: number;
  threshold?: number;
  onLowStock?: () => void;
}> = ({ quantity, threshold = 10, onLowStock }) => {
  const isLowStock = quantity <= threshold && quantity > 0;

  React.useEffect(() => {
    if (isLowStock && onLowStock) {
      onLowStock();
    }
  }, [isLowStock, onLowStock]);

  return (
    <div className="flex items-center gap-2">
      <StockBadge quantity={quantity} />
      {isLowStock && (
        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
          ⚠️ Stock faible
        </span>
      )}
    </div>
  );
};

export default StockBadge;

/**
 * ✅ EXEMPLES D'UTILISATION:
 * 
 * // Badge simple
 * <StockBadge quantity={product.stockQuantity} />
 * 
 * // Badge compact (uniquement emoji)
 * <CompactStockBadge quantity={product.stockQuantity} />
 * 
 * // Badge détaillé
 * <DetailedStockBadge quantity={product.stockQuantity} />
 * 
 * // Badge avec message personnalisé
 * <StockBadgeWithMessage 
 *   quantity={product.stockQuantity}
 *   customMessages={{
 *     OUT_OF_STOCK: "Épuisé",
 *     VERY_LOW: "Dernières pièces",
 *     LOW_STOCK: "Stock limité",
 *     IN_STOCK: "Disponible"
 *   }}
 * />
 * 
 * // Badge avec alerte
 * <StockBadgeWithAlert 
 *   quantity={product.stockQuantity}
 *   threshold={10}
 *   onLowStock={() => console.log('Stock bas!')}
 * />
 * 
 * // Badge personnalisé
 * <StockBadge 
 *   quantity={product.stockQuantity}
 *   size="lg"
 *   showEmoji={true}
 *   showLabel={true}
 *   className="shadow-md"
 * />
 */