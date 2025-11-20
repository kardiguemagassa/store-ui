/**
 * IMAGES CONFIGURATION — VERSION 3.0
 *
 * @location src/shared/constants/images.ts
 * Code typé strictement, avec gestion du cache et sécurité mémoire.
 */

import { logger } from "../types/errors.types";


//CONSTANTES / TYPES
export const UI_IMAGES = {
  PLACEHOLDER_PRODUCT: '/images/placeholder-product.png',
  PLACEHOLDER_AVATAR: '/images/placeholder-avatar.png',
  PLACEHOLDER_CATEGORY: '/images/placeholder-category.png',
  PLACEHOLDER_BANNER: '/images/placeholder-banner.jpg',
} as const;

export type UIImageKey = keyof typeof UI_IMAGES;

// Types MIME supportés pour l’upload.
export type AllowedImageType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';


//Extensions supportées.
export type AllowedImageExtension = '.jpg' | '.jpeg' | '.png' | '.webp' | '.gif';

export const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const satisfies readonly AllowedImageType[];

export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
] as const satisfies readonly AllowedImageExtension[];

// Type Guard → permet à TypeScript de comprendre que `file.type` est valide.
export const isAllowedImageType = (type: string): type is AllowedImageType =>
  ALLOWED_TYPES.includes(type as AllowedImageType);

//CONFIGURATION
export const IMAGES_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_FILES: 10,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS,

  // Formatte correctement l’URL d’une image de produit.
  getProductImage(imageUrl: string | null | undefined): string {
    if (!imageUrl) return UI_IMAGES.PLACEHOLDER_PRODUCT;
    if (imageUrl.startsWith('http')) return imageUrl;

    let cleanUrl = imageUrl.replace(/(\/?uploads\/?)\1+/g, '/uploads/');
    if (!cleanUrl.startsWith('/')) cleanUrl = `/${cleanUrl}`;

    return `${this.BASE_URL}${cleanUrl}`;
  },

  getUserAvatar(avatarUrl: string | null | undefined): string {
    return avatarUrl ? this.getProductImage(avatarUrl) : UI_IMAGES.PLACEHOLDER_AVATAR;
  },

  getCategoryIcon(iconUrl: string | null | undefined): string {
    return iconUrl ? this.getProductImage(iconUrl) : UI_IMAGES.PLACEHOLDER_CATEGORY;
  },

  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: `Fichier trop volumineux (max ${this.MAX_FILE_SIZE / 1024 / 1024}MB)` };
    }
    if (!isAllowedImageType(file.type)) {
      return { valid: false, error: 'Type de fichier non autorisé (JPG, PNG, WEBP, GIF uniquement)' };
    }
    return { valid: true };
  }
} as const;


// Fallback automatique d’image cassée dans un composant React.
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  fallbackUrl: string = UI_IMAGES.PLACEHOLDER_PRODUCT
): void => {
  const img = e.currentTarget;
  if (img.src !== fallbackUrl) {
    logger.warn('🖼️ Image failed, using fallback:', img.src);
    img.src = fallbackUrl;
  }
};

// IMAGE LOADING SYSTEM Cache mémoire : évite de recharger des images déjà vérifiées.
const imageExistsCache = new Map<string, boolean>();

// Précharge une image proprement avec possibilité d'annulation.
export const preloadImage = (src: string, signal?: AbortSignal): Promise<void> => {
  const cached = imageExistsCache.get(src);
  if (cached === true) return Promise.resolve();
  if (cached === false) return Promise.reject();

  return new Promise((resolve, reject) => {
    const img = new Image();

    if (signal) {
      signal.addEventListener('abort', () => {
        img.src = '';
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }

    img.onload = () => { imageExistsCache.set(src, true); resolve(); };
    img.onerror = () => { imageExistsCache.set(src, false); reject(); };
    img.src = src;
  });
};

// Vérifie si une image existe — version optimisée (cache + async).
export const imageExists = async (src: string): Promise<boolean> => {
  try {
    await preloadImage(src);
    return true;
  } catch {
    return false;
  }
};

//EXPORT FINAL 
const images = {
  UI_IMAGES,
  IMAGES_CONFIG,
  handleImageError,
  preloadImage,
  imageExists
};

export default images;
