import type { Product } from "../types/product";
import Price from "./Price";


interface ProductCardProps {
  product: Product;
}

export default function ProductCard({product}: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-card-image-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-card-image"
        />
      </div>
      <div className="product-card-details">
        <h2 className="product-card-title">{product.name}</h2>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-footer">
          <div className="product-card-price">
            <Price currency=" €" price={product.price} />
          </div>
        </div>
      </div>
    </div>
  );
}
