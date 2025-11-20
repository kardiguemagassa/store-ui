/**
 * PRODUCT TYPES - VERSION CORRIGÉE
 * 
 * ✅ CORRECTIONS APPLIQUÉES:
 * 1. SORT_MAPPING utilise maintenant PublicSortBy (UPPERCASE)
 * 2. Type cohérent entre UI et backend
 * 
 * VERSION 2.2 - FIXED SORT MAPPING
 */

// ============================================
// ENTITÉS PRINCIPALES
// ============================================


export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId?: number;
  categoryCode?: string;
  categoryName?: string;
  sku?: string;
  imageUrl?: string | null;
  galleryImages?: string[];
  isActive?: boolean;
  popularity?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  categoryId: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  productCount?: number;
}

// ============================================
// TYPES API
// ============================================

export interface ProductFormData {
  productId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  sku: string;
  isActive?: boolean;
}

export interface ProductUpdateData {
  productId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  sku: string;
  imageUrl?: string;
  isActive?: boolean;
}

// ============================================
// TYPES UI
// ============================================

export interface ProductFormState {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  sku: string;
  imageUrl?: string;
  galleryImages?: string[];
  isActive?: boolean;
}

export function productToFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description || "",
    price: product.price,
    stockQuantity: product.stockQuantity,
    categoryId: product.categoryId || 0,
    sku: product.sku || "",
    imageUrl: product.imageUrl || "",
    galleryImages: product.galleryImages || [],
    isActive: product.isActive ?? true
  };
}

export function formStateToUpdateData(formState: ProductFormState, productId: number): ProductUpdateData {
  return {
     productId: productId,
    name: formState.name,
    description: formState.description,
    price: formState.price,
    stockQuantity: formState.stockQuantity,
    categoryId: formState.categoryId,
    sku: formState.sku,
    imageUrl: formState.imageUrl,
    isActive: formState.isActive
  };
}

export function formStateToCreateData(formState: ProductFormState): ProductFormData {
  return {
    productId: 0, // À définir lors de l'appel
    name: formState.name,
    description: formState.description,
    price: formState.price,
    stockQuantity: formState.stockQuantity,
    categoryId: formState.categoryId,
    sku: formState.sku,
    isActive: formState.isActive
  };
}

// ============================================
// FILTRES PUBLIC
// ============================================

export type PublicSortBy = 
  | "NAME" 
  | "PRICE" 
  | "POPULARITY" 
  | "CREATED_DATE";

export type PublicSortDirection = "ASC" | "DESC";

export interface PublicProductFilters {
  page: number;
  size: number;
  sortBy: PublicSortBy;
  sortDirection: PublicSortDirection;
  query?: string;
  category?: string;
}

export const DEFAULT_PUBLIC_FILTERS: PublicProductFilters = {
  page: 0,
  size: 12,
  sortBy: "POPULARITY",
  sortDirection: "DESC"
};

// ============================================
// ✅ CORRECTION CRITIQUE: SORT_MAPPING
// ============================================

/**
 * Options de tri pour l'UI (labels affichés à l'utilisateur)
 */
export type SortOption =
  | "Popularité"
  | "Prix du plus bas au plus élevé"
  | "Prix du plus élevé au plus bas"
  | "Nouveautés";

/**
 * ✅ MAPPING CORRIGÉ: Utilise PublicSortBy avec valeurs UPPERCASE
 * 
 * AVANT (INCORRECT):
 * "Popularité": { sortBy: "popularity", sortDirection: "desc" }
 *                        ^^^^^^^^^^^ minuscules - ne correspond pas au backend!
 * 
 * APRÈS (CORRECT):
 * "Popularité": { sortBy: "POPULARITY", sortDirection: "DESC" }
 *                        ^^^^^^^^^^^ MAJUSCULES - correspond au backend!
 */
export const SORT_MAPPING: Record<
  SortOption,
  { sortBy: PublicSortBy; sortDirection: PublicSortDirection }
> = {
  "Popularité": { sortBy: "POPULARITY", sortDirection: "DESC" },
  "Prix du plus bas au plus élevé": { sortBy: "PRICE", sortDirection: "ASC" },
  "Prix du plus élevé au plus bas": { sortBy: "PRICE", sortDirection: "DESC" },
  "Nouveautés": { sortBy: "CREATED_DATE", sortDirection: "DESC" }
};

/**
 * ✅ Helper pour récupérer les paramètres backend depuis une SortOption UI
 */
export function getSortParams(sortOption: SortOption): { sortBy: PublicSortBy; sortDirection: PublicSortDirection } {
  return SORT_MAPPING[sortOption];
}

/**
 * ✅ Helper inverse: récupérer la SortOption depuis les paramètres backend
 */
export function getSortOptionFromParams(sortBy: string, sortDirection: string): SortOption {
  // Normaliser en uppercase
  const normalizedSortBy = sortBy.toUpperCase();
  const normalizedDirection = sortDirection.toUpperCase();
  
  // Chercher la correspondance
  for (const [option, params] of Object.entries(SORT_MAPPING)) {
    if (params.sortBy === normalizedSortBy && params.sortDirection === normalizedDirection) {
      return option as SortOption;
    }
  }
  
  // Fallback: Popularité
  return "Popularité";
}

// ============================================
// FILTRES ADMIN
// ============================================

export type AdminSortBy = 
  | "NAME" 
  | "PRICE" 
  | "POPULARITY" 
  | "CREATED_DATE" 
  | "STOCK_QUANTITY";

export type AdminSortDirection = "ASC" | "DESC";

export interface AdminProductFilters {
  page: number;
  size: number;
  sortBy: AdminSortBy;
  sortDirection: AdminSortDirection;
  query?: string;
  category?: string;
  activeOnly: boolean | null; 
}

export const DEFAULT_ADMIN_FILTERS: AdminProductFilters = {
  page: 0,
  size: 10,
  sortBy: "NAME",
  sortDirection: "ASC",
  activeOnly: null
};

// ============================================
// RÉPONSE PAGINÉE
// ============================================

// Dans product.types.ts
export interface PaginatedProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // page courante
  first: boolean;
  last: boolean;
  numberOfElements?: number;
  empty?: boolean;
  // ✅ Ajouter les champs Spring Data si nécessaire
  pageable?: unknown;
  sort?: unknown;
}

// ============================================
// RECHERCHE AVANCÉE
// ============================================

export interface ProductSearchCriteria {
  page: number;
  size: number;
  searchQuery?: string;
  categoryCode?: string;
  activeOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: PublicSortBy;
  sortDirection?: PublicSortDirection;
}

// ============================================
// STOCK STATUS
// ============================================

export type StockStatus = 
  | "IN_STOCK"
  | "LOW_STOCK"
  | "VERY_LOW"
  | "OUT_OF_STOCK";

export function getStockStatus(quantity: number): StockStatus {
  if (quantity > 50) return "IN_STOCK";
  if (quantity > 10) return "LOW_STOCK";
  if (quantity > 0) return "VERY_LOW";
  return "OUT_OF_STOCK";
}

export const STOCK_BADGE_COLORS: Record<StockStatus, string> = {
  IN_STOCK: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  LOW_STOCK: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  VERY_LOW: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  OUT_OF_STOCK: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
};

export const STOCK_BADGE_EMOJIS: Record<StockStatus, string> = {
  IN_STOCK: "🟢",
  LOW_STOCK: "🔵",
  VERY_LOW: "🟡",
  OUT_OF_STOCK: "🔴"
};

export function getStockLabel(quantity: number): string {
  const status = getStockStatus(quantity);
  if (status === "OUT_OF_STOCK") return "Rupture";
  return `${quantity} unités`;
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidProduct(product: Partial<Product>): boolean {
  return !!(
    product.name &&
    product.price !== undefined &&
    product.price > 0 &&
    product.stockQuantity !== undefined &&
    product.stockQuantity >= 0 &&
    product.categoryId
  );
}

export function isInStock(product: Product): boolean {
  return product.stockQuantity > 0;
}

export function isActiveProduct(product: Product): boolean {
  return product.isActive !== false;
}

/**
 * ✅ RÉSUMÉ DES CORRECTIONS v2.2:
 * 
 * 1. SORT_MAPPING utilise maintenant PublicSortBy (type strict)
 * 2. Valeurs en MAJUSCULES pour correspondre au backend
 * 3. Ajout de getSortParams() et getSortOptionFromParams() helpers
 * 4. Type-safe à 100%
 * 
 * AVANT:
 * sortBy: "popularity" (string générique, minuscule)
 * 
 * APRÈS:
 * sortBy: "POPULARITY" (PublicSortBy, majuscule)
 */