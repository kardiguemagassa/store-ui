/**
 * PRODUCT LOADER
 * 
 * Loader pour charger les données d'un produit avant le rendu
 * Utilisé par React Router pour la route /products/:productId
 * 
 * @version 1.0
 * @location src/features/products/loaders/productLoader.ts
 */

/**
 * PRODUCT LOADER
 *
 * Loader pour charger les données d'un produit avant le rendu
 * Utilisé par React Router pour la route /products/:productId
 *
 * @version 1.0
 * @location src/features/products/loaders/productLoader.ts
 */
import type { LoaderFunctionArgs } from 'react-router-dom';
import { getProductById } from '../services/productService';

export async function productLoader({ params }: LoaderFunctionArgs) {
  const productId = params.productId;
  
  if (!productId) {
    throw new Response('Product ID not found', { status: 404 });
  }

  try {
    console.log('🔄 Loading product:', productId);
    const product = await getProductById(Number(productId));
    console.log('✅ Product loaded:', product.name);
    return product;
  } catch (error) {
    console.error('❌ Error loading product:', error);
    throw new Response('Product not found', { status: 404 });
  }
}
