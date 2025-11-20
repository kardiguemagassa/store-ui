/**
 * IMAGE UPLOAD MULTIPLE COMPONENT
 * 
 * Composant réutilisable pour uploader plusieurs images
 * avec drag & drop et validation
 * 
 * VERSION 1.0 - PRODUCTION READY
 * 
 * @version 1.0
 * @location src/features/products/components/ImageUploadMultiple.tsx
 */

import React, { useRef, useState } from 'react';

// ============================================
// TYPES
// ============================================

interface ImageUploadMultipleProps {
  onUpload: (files: FileList) => void | Promise<void>;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // En bytes
  accept?: string;
  className?: string;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export const ImageUploadMultiple: React.FC<ImageUploadMultipleProps> = ({
  onUpload,
  disabled = false,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB par défaut
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > maxFiles) {
        alert(`Maximum ${maxFiles} fichiers à la fois`);
        return;
      }
      onUpload(e.target.files);
      // Réinitialiser l'input
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > maxFiles) {
        alert(`Maximum ${maxFiles} fichiers à la fois`);
        return;
      }
      onUpload(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg p-8 transition-all
        ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700'
        }
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-primary dark:hover:border-light'
        }
        ${className}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="text-center">
        {/* Icon */}
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        {/* Texte */}
        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {disabled
            ? 'Upload en cours...'
            : isDragging
            ? 'Déposez les fichiers ici'
            : 'Cliquez ou glissez-déposez des images'}
        </p>

        {/* Infos */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          PNG, JPG, WEBP, GIF • Max {maxFiles} fichiers • {maxFileSize / (1024 * 1024)}MB max/fichier
        </p>
      </div>
    </div>
  );
};

/**
 * ✅ Variante avec prévisualisation
 */
export const ImageUploadWithPreview: React.FC<
  ImageUploadMultipleProps & {
    previewImages?: string[];
    onRemovePreview?: (index: number) => void;
  }
> = ({ previewImages = [], onRemovePreview, ...uploadProps }) => (
  <div className="space-y-4">
    <ImageUploadMultiple {...uploadProps} />

    {previewImages.length > 0 && (
      <div className="grid grid-cols-4 gap-4">
        {previewImages.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            {onRemovePreview && (
              <button
                onClick={() => onRemovePreview(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * ✅ Variante compacte
 */
export const CompactImageUpload: React.FC<ImageUploadMultipleProps> = (props) => (
  <ImageUploadMultiple {...props} className="p-4" />
);

export default ImageUploadMultiple;

/**
 * ✅ EXEMPLES D'UTILISATION:
 * 
 * // Upload simple
 * <ImageUploadMultiple 
 *   onUpload={(files) => handleUpload(Array.from(files))}
 *   disabled={isLoading}
 * />
 * 
 * // Upload avec configuration
 * <ImageUploadMultiple 
 *   onUpload={handleUpload}
 *   maxFiles={5}
 *   maxFileSize={10 * 1024 * 1024} // 10MB
 *   accept="image/png,image/jpeg"
 *   disabled={isUploading}
 * />
 * 
 * // Upload avec prévisualisation
 * <ImageUploadWithPreview
 *   onUpload={handleUpload}
 *   previewImages={imageUrls}
 *   onRemovePreview={(index) => {
 *     setImageUrls(prev => prev.filter((_, i) => i !== index));
 *   }}
 * />
 * 
 * // Upload compact
 * <CompactImageUpload 
 *   onUpload={handleUpload}
 *   maxFiles={3}
 * />
 */