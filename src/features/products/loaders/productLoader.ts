import type { LoaderFunctionArgs } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { logger } from '../../../shared/types/errors.types';

export async function productLoader({ params }: LoaderFunctionArgs) {
  const productId = params.productId;
  
  if (!productId) {
    logger.error("ID produit manquant dans les paramètres", "productLoader");
    throw new Response('Product ID not found', { status: 404 });
  }

  try {
    logger.debug("Chargement produit", "productLoader", { productId });
    
    const product = await getProductById(Number(productId));
    
    logger.info("Produit chargé avec succès", "productLoader", {
      productId: product.productId,
      productName: product.name,
      hasImage: !!product.imageUrl
    });
    
    return product;
  } catch (error) {
    logger.error("Erreur chargement produit", "productLoader", error, { productId });
    throw new Response('Product not found', { status: 404 });
  }
}