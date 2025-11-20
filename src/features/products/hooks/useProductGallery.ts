import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import type { Product } from '../types/product.types';
import { getProductById, removeGalleryImage, reorderGallery, uploadGalleryImages } from '../services/adminProductService';
import { getErrorMessage, logger } from '../../../shared/types/errors.types';

// TYPES
interface UseProductGalleryOptions {
  productId: number;
  initialImages?: string[];
  onImagesChange?: (images: string[]) => void;
  maxFileSize?: number; // En bytes (défaut: 5MB)
  maxFiles?: number; // Nombre max de fichiers (défaut: 10)
  allowedTypes?: string[]; // Types MIME acceptés
}

interface UseProductGalleryReturn {
  // État
  images: string[];
  isLoading: boolean;
  isDragging: boolean;
  error: string | null;
  
  // Actions
  uploadImages: (files: FileList) => Promise<void>;
  removeImage: (imageUrl: string) => Promise<void>;
  reorderImages: (newOrder: string[]) => Promise<void>;
  setIsDragging: (isDragging: boolean) => void;
  clearError: () => void;
  
  // Validations
  validateFiles: (files: FileList) => { valid: File[]; errors: string[] };
}

// HOOK PRINCIPAL
export function useProductGallery(
  options: UseProductGalleryOptions
): UseProductGalleryReturn {
  const {
    productId,
    initialImages = [],
    onImagesChange,
    maxFileSize = 5 * 1024 * 1024, // 5MB par défaut
    maxFiles = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  } = options;

  // États
  const [images, setImages] = useState<string[]>(initialImages);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les images initiales si non fournies
  useEffect(() => {
    const loadImages = async () => {
      if (initialImages.length > 0) {
        setImages(initialImages);
        return;
      }

      try {
        setIsLoading(true);
        logger.debug("Chargement images galerie", "useProductGallery", { productId });
        
        const product: Product = await getProductById(productId);
        
        if (product.galleryImages && product.galleryImages.length > 0) {
          setImages(product.galleryImages);
          onImagesChange?.(product.galleryImages);
          
          logger.debug("Images galerie chargées", "useProductGallery", {
            productId,
            imagesCount: product.galleryImages.length
          });
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        logger.error("Erreur chargement galerie", "useProductGallery", err, { productId });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [productId, initialImages.length, onImagesChange, initialImages]);

  // Validation des fichiers avant upload
  const validateFiles = useCallback(
    (files: FileList): { valid: File[]; errors: string[] } => {
      const fileArray = Array.from(files);
      const errors: string[] = [];
      const valid: File[] = [];

      // Vérifier le nombre de fichiers
      if (fileArray.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} fichiers à la fois`);
        return { valid: [], errors };
      }

      // Vérifier chaque fichier
      fileArray.forEach((file) => {
        // Vérifier la taille
        if (file.size > maxFileSize) {
          errors.push(`${file.name}: dépasse ${maxFileSize / (1024 * 1024)}MB`);
          return;
        }

        // Vérifier le type
        if (!allowedTypes.includes(file.type)) {
          errors.push(`${file.name}: type non autorisé (${file.type})`);
          return;
        }

        valid.push(file);
      });

      return { valid, errors };
    },
    [maxFileSize, maxFiles, allowedTypes]
  );

  // Upload des images
  const uploadImages = useCallback(
    async (files: FileList): Promise<void> => {
      if (files.length === 0) return;

      // Validation
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        const errorMessage = errors.join('\n');
        setError(errorMessage);
        logger.warn("Validation fichiers échouée", "useProductGallery", {
          filesCount: files.length,
          errorsCount: errors.length
        });
        toast.error(errorMessage);
        return;
      }

      if (valid.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        logger.info("Upload images galerie", "useProductGallery", {
          productId,
          filesCount: valid.length,
          fileNames: valid.map(f => f.name)
        });

        const uploadedUrls = await uploadGalleryImages(productId, valid);
        const newImages = [...images, ...uploadedUrls];

        setImages(newImages);
        onImagesChange?.(newImages);

        logger.info("Images uploadées avec succès", "useProductGallery", {
          productId,
          uploadedCount: uploadedUrls.length,
          totalImages: newImages.length
        });
        
        toast.success(`${uploadedUrls.length} image(s) ajoutée(s)`);
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        logger.error("Erreur upload images", "useProductGallery", err, {
          productId,
          filesCount: valid.length
        });
        setError(errorMessage);
        toast.error(`Erreur upload: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [productId, images, onImagesChange, validateFiles]
  );

  // Suppression d'une image 
  const removeImage = useCallback(
    async (imageUrl: string): Promise<void> => {
      // Confirmation
      if (!window.confirm('Supprimer cette image de la galerie ?')) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        logger.info("Suppression image galerie", "useProductGallery", {
          productId,
          imageUrlLength: imageUrl.length
        });

        await removeGalleryImage(productId, imageUrl);
        const newImages = images.filter((img) => img !== imageUrl);

        setImages(newImages);
        onImagesChange?.(newImages);

        logger.info("Image supprimée avec succès", "useProductGallery", {
          productId,
          remainingImages: newImages.length
        });
        
        toast.success('Image supprimée');
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        logger.error("Erreur suppression image", "useProductGallery", err, {
          productId,
          imageUrlLength: imageUrl.length
        });
        setError(errorMessage);
        toast.error(`Erreur suppression: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [productId, images, onImagesChange]
  );

  // Réorganisation des images
  const reorderImages = useCallback(
    async (newOrder: string[]): Promise<void> => {
      // Éviter les appels inutiles
      if (JSON.stringify(newOrder) === JSON.stringify(images)) {
        logger.debug("Aucun changement d'ordre détecté", "useProductGallery", { productId });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        logger.info("Réorganisation galerie", "useProductGallery", {
          productId,
          imagesCount: newOrder.length
        });

        await reorderGallery(productId, newOrder);

        setImages(newOrder);
        onImagesChange?.(newOrder);

        logger.info("Galerie réorganisée avec succès", "useProductGallery", {
          productId,
          imagesCount: newOrder.length
        });
        
        toast.success('Galerie réorganisée');
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        logger.error("Erreur réorganisation galerie", "useProductGallery", err, {
          productId,
          imagesCount: newOrder.length
        });
        setError(errorMessage);
        toast.error(`Erreur réorganisation: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [productId, images, onImagesChange]
  );

  //Effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // État
    images,
    isLoading,
    isDragging,
    error,

    // Actions
    uploadImages,
    removeImage,
    reorderImages,
    setIsDragging,
    clearError,

    // Validations
    validateFiles
  };
}

export default useProductGallery;