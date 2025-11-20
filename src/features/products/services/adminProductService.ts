import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage, logger } from '../../../shared/types/errors.types';
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
    // ✅ CORRECTION : Gestion de la valeur null pour activeOnly
    const activeOnlyValue = filters.activeOnly !== null ? filters.activeOnly.toString() : 'false';
    
    const params: Record<string, string> = {
      page: filters.page.toString(),
      size: filters.size.toString(),
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      activeOnly: activeOnlyValue
    };

    if (filters.query) params.query = filters.query;
    if (filters.category) params.category = filters.category;

    logger.debug("Récupération produits admin", "AdminProductService", {
      page: filters.page,
      size: filters.size,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      activeOnly: activeOnlyValue,
      hasQuery: !!filters.query,
      hasCategory: !!filters.category
    });

    const response = await apiClient.get<PaginatedProductsResponse>('/products', { params });
    
    logger.debug("Produits admin récupérés", "AdminProductService", {
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      currentPage: response.data.number,
      contentLength: response.data.content?.length || 0
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur récupération produits admin", "AdminProductService", error, {
      page: filters.page,
      activeOnly: filters.activeOnly
    });
    throw new Error(getErrorMessage(error));
  }
}

export async function getProductById(productId: number): Promise<Product> {
  try {
    logger.debug("Récupération produit par ID", "AdminProductService", { productId });
    
    const response = await apiClient.get<Product>(`/products/${productId}`);
    
    logger.debug("Produit récupéré avec succès", "AdminProductService", {
      productId,
      productName: response.data.name,
      isActive: response.data.isActive
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur récupération produit par ID", "AdminProductService", error, { productId });
    throw new Error(getErrorMessage(error));
  }
}

export async function createProduct(productData: ProductFormData): Promise<Product> {
  try {
    logger.info("Création nouveau produit", "AdminProductService", {
      productName: productData.name,
      hasPrice: !!productData.price
    });
    
    const response = await apiClient.post<Product>('/products', productData);
    
    logger.info("Produit créé avec succès", "AdminProductService", {
      productId: response.data.productId,
      productName: response.data.name
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur création produit", "AdminProductService", error, {
      productName: productData.name
    });
    throw new Error(getErrorMessage(error));
  }
}

export async function updateProduct(productId: number, productData: ProductUpdateData): Promise<Product> {
  try {
    logger.info("Mise à jour produit", "AdminProductService", {
      productId,
      fieldsUpdated: Object.keys(productData)
    });
    
    const response = await apiClient.put<Product>(`/products/${productId}`, productData);
    
    logger.info("Produit mis à jour avec succès", "AdminProductService", {
      productId,
      productName: response.data.name
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur mise à jour produit", "AdminProductService", error, { productId });
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteProduct(productId: number): Promise<void> {
  try {
    logger.info("Suppression produit", "AdminProductService", { productId });
    
    await apiClient.delete(`/products/${productId}`);
    
    logger.info("Produit supprimé avec succès", "AdminProductService", { productId });

  } catch (error: unknown) {
    logger.error("Erreur suppression produit", "AdminProductService", error, { productId });
    throw new Error(getErrorMessage(error));
  }
}

export async function restoreProduct(productId: number): Promise<void> {
  try {
    logger.info("Restauration produit", "AdminProductService", { productId });
    
    await apiClient.patch(`/products/admin/${productId}/restore`);
    
    logger.info("Produit restauré avec succès", "AdminProductService", { productId });

  } catch (error: unknown) {
    logger.error("Erreur restauration produit", "AdminProductService", error, { productId });
    throw new Error(getErrorMessage(error));
  }
}

// GESTION IMAGE PRINCIPALE

export async function uploadImage(productId: number, imageFile: File): Promise<Product> {
  try {
    logger.info("Upload image principale", "AdminProductService", {
      productId,
      fileName: imageFile.name,
      fileSize: imageFile.size
    });
    
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

    logger.info("Image principale uploadée avec succès", "AdminProductService", {
      productId,
      fileName: imageFile.name
    });

    return response.data;

  } catch (error: unknown) {
    logger.error("Erreur upload image principale", "AdminProductService", error, {
      productId,
      fileName: imageFile.name
    });
    throw new Error(getErrorMessage(error));
  }
}

// GESTION GALERIE IMAGES

export async function uploadGalleryImages(productId: number, imageFiles: File[]): Promise<string[]> {
  try {
    logger.info("Upload images galerie", "AdminProductService", {
      productId,
      filesCount: imageFiles.length,
      fileNames: imageFiles.map(f => f.name)
    });
    
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

    logger.info("Images galerie uploadées avec succès", "AdminProductService", {
      productId,
      imagesCount: imageUrls.length
    });

    return imageUrls;

  } catch (error: unknown) {
    logger.error("Erreur upload images galerie", "AdminProductService", error, {
      productId,
      filesCount: imageFiles.length
    });
    throw new Error(getErrorMessage(error));
  }
}

export async function removeGalleryImage(productId: number, imageUrl: string): Promise<void> {
  try {
    logger.info("Suppression image galerie", "AdminProductService", {
      productId,
      imageUrlLength: imageUrl.length
    });
    
    const encodedImageUrl = encodeURIComponent(imageUrl);
    await apiClient.delete(`/products/${productId}/gallery?imageUrl=${encodedImageUrl}`);
    
    logger.info("Image galerie supprimée avec succès", "AdminProductService", {
      productId
    });

  } catch (error: unknown) {
    logger.error("Erreur suppression image galerie", "AdminProductService", error, {
      productId,
      imageUrlLength: imageUrl.length
    });
    throw new Error(getErrorMessage(error));
  }
}

export async function reorderGallery(productId: number, imageUrls: string[]): Promise<void> {
  try {
    logger.info("Réorganisation galerie", "AdminProductService", {
      productId,
      imagesCount: imageUrls.length
    });
    
    await apiClient.put(`/products/${productId}/gallery/reorder`, { order: imageUrls });
    
    logger.info("Galerie réorganisée avec succès", "AdminProductService", {
      productId,
      imagesCount: imageUrls.length
    });

  } catch (error: unknown) {
    logger.error("Erreur réorganisation galerie", "AdminProductService", error, {
      productId,
      imagesCount: imageUrls.length
    });
    throw new Error(getErrorMessage(error));
  }
}

export async function addToGallery(productId: number, imageFile: File): Promise<string> {
  try {
    logger.info("Ajout image galerie", "AdminProductService", {
      productId,
      fileName: imageFile.name,
      fileSize: imageFile.size
    });
    
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

    logger.info("Image galerie ajoutée avec succès", "AdminProductService", {
      productId,
      fileName: imageFile.name
    });

    return imageUrl;

  } catch (error: unknown) {
    logger.error("Erreur ajout image galerie", "AdminProductService", error, {
      productId,
      fileName: imageFile.name
    });
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
    logger.debug("Calcul statistiques produits", "AdminProductService");
    
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

    logger.debug("Statistiques produits calculées", "AdminProductService", {
      total,
      active,
      inactive,
      lowStock
    });

    return { total, active, inactive, lowStock };

  } catch (error: unknown) {
    logger.error("Erreur calcul statistiques produits", "AdminProductService", error);
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