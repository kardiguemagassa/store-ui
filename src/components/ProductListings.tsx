import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface ProductListingsProps {
  products: Product[];
}

export default function ProductListings({products}: ProductListingsProps) {
  return (
    <div className="product-listings-container">
        <div className="product-listings-grid">
            {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))
        ) : (
          <p className="product-listings-empty">No products found</p>
        )}
        </div>
    </div>

  )
}
