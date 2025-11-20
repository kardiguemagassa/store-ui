import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage } from '../../../shared/types/errors.types';
import type { 
  AdminProductFilters, 
  PaginatedProductsResponse, 
  Product, 
  ProductFormData, 
  ProductUpdateData 
} from '../types/product.types';

// PRODUITS ADMIN CRUD

export async function getAllProducts(filters: AdminProductFilters): Promise<PaginatedProductsResponse> {
  try {
    const params: Record<string, string> = {
      page: filters.page.toString(),
      size: filters.size.toString(),
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      activeOnly: filters.activeOnly.toString()
    };

    if (filters.query) params.query = filters.query;
    if (filters.category) params.category = filters.category;

    const response = await apiClient.get<PaginatedProductsResponse>('/products', { params });
    return response.data;

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getProductById(productId: number): Promise<Product> {
  try {
    const response = await apiClient.get<Product>(`/products/${productId}`);
    return response.data;

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createProduct(productData: ProductFormData): Promise<Product> {
  try {
    const response = await apiClient.post<Product>('/products', productData);
    return response.data;

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProduct(productId: number, productData: ProductUpdateData): Promise<Product> {
  try {
    const response = await apiClient.put<Product>(`/products/${productId}`, productData);
    return response.data;

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteProduct(productId: number): Promise<void> {
  try {
    await apiClient.delete(`/products/${productId}`);

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function restoreProduct(productId: number): Promise<void> {
  try {
    await apiClient.patch(`/products/admin/${productId}/restore`);

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

// GESTION IMAGE PRINCIPALE

export async function uploadImage(productId: number, imageFile: File): Promise<Product> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post<Product>(
      `/products/${productId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

// GESTION GALERIE IMAGES

export async function uploadGalleryImages(productId: number, imageFiles: File[]): Promise<string[]> {
  try {
    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const response = await apiClient.post<{ imageUrls: string[] } | string[]>(
      `/products/${productId}/gallery`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const imageUrls = Array.isArray(response.data)
      ? response.data
      : (response.data as { imageUrls: string[] }).imageUrls || [];

    return imageUrls;

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function removeGalleryImage(productId: number, imageUrl: string): Promise<void> {
  try {
    const encodedImageUrl = encodeURIComponent(imageUrl);
    await apiClient.delete(`/products/${productId}/gallery?imageUrl=${encodedImageUrl}`);

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function reorderGallery(productId: number, imageUrls: string[]): Promise<void> {
  try {
    await apiClient.put(`/products/${productId}/gallery/reorder`, { order: imageUrls });

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

export async function addToGallery(productId: number, imageFile: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post<{ imageUrl: string } | string>(
      `/products/${productId}/gallery/single`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const imageUrl = typeof response.data === 'string'
      ? response.data
      : response.data.imageUrl;

    return imageUrl;

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

// STATISTIQUES ADMIN

export async function getProductStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
}> {
  try {
    const allProducts = await getAllProducts({
      page: 0,
      size: 1000,
      sortBy: 'NAME',
      sortDirection: 'ASC',
      activeOnly: false
    });

    const total = allProducts.totalElements;
    const active = allProducts.content.filter(p => p.isActive).length;
    const inactive = total - active;
    const lowStock = allProducts.content.filter(p => p.stockQuantity < 10).length;

    return { total, active, inactive, lowStock };

  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
}

// EXPORT PAR DÉFAUT

const adminProductService = {
  // CRUD
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  
  // Image principale
  uploadImage,
  
  // Galerie
  uploadGalleryImages,
  addToGallery,
  removeGalleryImage,
  reorderGallery,
  
  // Stats
  getProductStats
};

export default adminProductService;