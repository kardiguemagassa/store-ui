/**
 * IMAGE GALLERY COMPONENT
 * 
 * Composant réutilisable pour afficher une galerie d'images
 * avec drag & drop pour réorganiser et suppression
 * 
 * VERSION 1.0 - PRODUCTION READY
 * 
 * @version 1.0
 * @location src/features/products/components/ImageGallery.tsx
 */

import React, { useState } from 'react';

// ============================================
// TYPES
// ============================================

interface ImageGalleryProps {
  images: string[];
  onReorder?: (newOrder: string[]) => void | Promise<void>;
  onRemove: (imageUrl: string) => void | Promise<void>;
  isLoading?: boolean;
  showBadges?: boolean;
  allowReorder?: boolean;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onReorder,
  onRemove,
  isLoading = false,
  showBadges = true,
  allowReorder = true,
  columns = 4,
  className = ''
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (allowReorder && onReorder) {
      setDraggedIndex(index);
    }
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex || !onReorder) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    onReorder(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
  }[columns];

  if (images.length === 0) {
    return <EmptyGallery />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={`grid ${gridColsClass} gap-4`}>
        {images.map((imageUrl, index) => (
          <div
            key={`${imageUrl}-${index}`}
            className={`
              relative aspect-square rounded-lg overflow-hidden border transition-all
              ${
                draggedIndex === index
                  ? 'opacity-50 scale-95'
                  : 'opacity-100 scale-100'
              }
              ${
                dragOverIndex === index
                  ? 'border-blue-500 border-2 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700'
              }
              ${
                isLoading
                  ? 'pointer-events-none'
                  : allowReorder && onReorder
                  ? 'cursor-move hover:shadow-lg'
                  : ''
              }
            `}
            draggable={!isLoading && allowReorder && !!onReorder}
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
          >
            {/* Image */}
            <img
              src={imageUrl}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
              }}
            />

            {/* Badge position */}
            {showBadges && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                {index + 1}
              </div>
            )}

            {/* Bouton suppression */}
            <button
              onClick={() => onRemove(imageUrl)}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title="Supprimer cette image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Overlay loading */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions drag & drop */}
      {images.length > 1 && !isLoading && allowReorder && onReorder && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Glissez-déposez les images pour les réorganiser
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * ✅ État vide
 */
const EmptyGallery: React.FC = () => (
  <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12">
    <div className="text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="mt-4 text-gray-500 dark:text-gray-400">Aucune image dans la galerie</p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Ajoutez des images en utilisant la zone d'upload ci-dessus
      </p>
    </div>
  </div>
);

/**
 * ✅ Variante simple (pas de réorganisation)
 */
export const SimpleImageGallery: React.FC<{
  images: string[];
  onRemove: (url: string) => void;
}> = ({ images, onRemove }) => (
  <ImageGallery
    images={images}
    onRemove={onRemove}
    allowReorder={false}
    showBadges={false}
  />
);

/**
 * ✅ Variante grid compacte
 */
export const CompactImageGallery: React.FC<ImageGalleryProps> = (props) => (
  <ImageGallery {...props} columns={5} showBadges={false} />
);

/**
 * ✅ Variante grid large
 */
export const LargeImageGallery: React.FC<ImageGalleryProps> = (props) => (
  <ImageGallery {...props} columns={3} />
);

export default ImageGallery;

/**
 * ✅ EXEMPLES D'UTILISATION:
 * 
 * // Galerie complète avec réorganisation
 * <ImageGallery 
 *   images={galleryImages}
 *   onReorder={handleReorder}
 *   onRemove={handleRemove}
 *   isLoading={isLoading}
 * />
 * 
 * // Galerie simple sans réorganisation
 * <SimpleImageGallery 
 *   images={galleryImages}
 *   onRemove={handleRemove}
 * />
 * 
 * // Galerie avec configuration personnalisée
 * <ImageGallery 
 *   images={galleryImages}
 *   onReorder={handleReorder}
 *   onRemove={handleRemove}
 *   columns={3}
 *   showBadges={false}
 *   allowReorder={true}
 * />
 * 
 * // Galerie compacte
 * <CompactImageGallery 
 *   images={galleryImages}
 *   onRemove={handleRemove}
 * />
 * 
 * // Galerie large
 * <LargeImageGallery 
 *   images={galleryImages}
 *   onReorder={handleReorder}
 *   onRemove={handleRemove}
 * />
 */