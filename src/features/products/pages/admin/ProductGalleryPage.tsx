import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getProductById } from '../../services/adminProductService';
import { getErrorMessage, logger } from '../../../../shared/types/errors.types';
import type { Product } from '../../types/product.types';
import ProductGalleryManager from '../../components/ProductGalleryManager';
import { IMAGES_CONFIG, handleImageError } from '../../../../shared/constants/images';

export default function ProductGalleryPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageCount, setImageCount] = useState(0);

  // CHARGEMENT DU PRODUIT
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        logger.error("ID produit manquant dans l'URL", "ProductGalleryPage");
        toast.error('ID de produit invalide');
        navigate('/admin/products');
        return;
      }

      try {
        setLoading(true);
        logger.debug("Chargement du produit", "ProductGalleryPage", { productId });
        
        const productData = await getProductById(Number(productId));
        
        logger.info("Produit chargé avec succès", "ProductGalleryPage", {
          productId: productData.productId,
          productName: productData.name,
          hasMainImage: !!productData.imageUrl,
          galleryCount: productData.galleryImages?.length || 0
        });
        
        setProduct(productData);
        setImageCount(productData.galleryImages?.length || 0);

      } catch (error: unknown) {
        logger.error("Erreur chargement produit", "ProductGalleryPage", error, { productId });
        toast.error(`Erreur: ${getErrorMessage(error)}`);
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, navigate]);

  // HANDLERS
  const handleImagesChange = (images: string[]) => {
    logger.debug("Galerie mise à jour", "ProductGalleryPage", {
      imagesCount: images.length,
      productId
    });
    setImageCount(images.length);
  };

  const handleBackToProducts = () => {
    navigate('/admin/products');
  };

  const handleEditProduct = () => {
    navigate(`/admin/products/edit/${productId}`);
  };

  const handleViewProduct = () => {
    navigate(`/products/${productId}`);
  };

  // ÉTATS DE CHARGEMENT
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Chargement du produit...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Produit non trouvé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={handleBackToProducts}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-dark transition"
          >
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  // Préparer l'URL de l'image principale
  const mainImageUrl = product.imageUrl ? IMAGES_CONFIG.getProductImage(product.imageUrl): null;

  // RENDER PRINCIPAL
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête de la page */}
      <div className="mb-8">
        {/* Fil d'Ariane */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link 
            to="/admin/products" 
            className="hover:text-primary transition"
          >
            Produits
          </Link>
          <span>›</span>
          <Link 
            to={`/admin/products/edit/${productId}`} 
            className="hover:text-primary transition"
          >
            {product.name}
          </Link>
          <span>›</span>
          <span className="text-gray-900 dark:text-white font-medium">
            Galerie
          </span>
        </nav>

        {/* Titre et actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Galerie d'images
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{product.name}</span>
              <span>•</span>
              <span>ID: {product.productId}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={imageCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                  📸 {imageCount} image{imageCount !== 1 ? 's' : ''}
                </span>
              </span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleViewProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              title="Voir le produit"
            >
              <span>👁️</span>
              <span className="hidden sm:inline">Voir le produit</span>
            </button>
            
            <button
              onClick={handleEditProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              title="Modifier le produit"
            >
              <span>✏️</span>
              <span className="hidden sm:inline">Modifier</span>
            </button>

            <button
              onClick={handleBackToProducts}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
            >
              <span>←</span>
              <span className="hidden sm:inline">Retour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Informations du produit */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image principale */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Image principale
            </h3>
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-4xl">📦</span>
              </div>
            )}
            {product.imageUrl && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate" title={product.imageUrl}>
                {product.imageUrl}
              </p>
            )}
          </div>

          {/* Informations */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Informations du produit
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Prix</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.price?.toFixed(2)} €
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Stock</span>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.stockQuantity} unités
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Catégorie</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.categoryName || '—'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Statut</span>
                <p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {product.isActive ? '🟢 Actif' : '🔴 Inactif'}
                  </span>
                </p>
              </div>
            </div>
            {product.description && (
              <div className="mt-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">Description</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composant de gestion de la galerie */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ProductGalleryManager
          productId={Number(productId)}
          initialImages={product.galleryImages || []}
          maxImages={10}
          maxFileSize={5}
          onImagesChange={handleImagesChange}
        />
      </div>

      {/* Actions finales */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {imageCount === 0 ? (
            <span>⚠️ Aucune image dans la galerie</span>
          ) : imageCount >= 8 ? (
            <span className="text-green-600 dark:text-green-400">
              ✅ Galerie complète ({imageCount} images)
            </span>
          ) : (
            <span>
              📸 {imageCount} image{imageCount !== 1 ? 's' : ''} dans la galerie
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEditProduct}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-dark transition font-medium"
          >
            Modifier le produit
          </button>
          
          <button
            onClick={handleBackToProducts}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            Terminé
          </button>
        </div>
      </div>

      {/* Aide contextuelle */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Conseils pour une galerie optimale
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Ajoutez 3 à 8 images pour une meilleure présentation</li>
              <li>• La première image sera affichée en premier sur la fiche produit</li>
              <li>• Utilisez des images de haute qualité (max 5MB par image)</li>
              <li>• Glissez-déposez les images pour changer leur ordre</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}