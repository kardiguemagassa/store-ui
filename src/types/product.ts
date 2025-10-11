export interface Product {
  productId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stockQuantity: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  popularity?: number;
}

//Pour la recherche et filtrage
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  tags?: string[];
  inStock?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// RÉPONSE PAGINÉE - Pour les listes de produits
export interface PaginatedProducts {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}