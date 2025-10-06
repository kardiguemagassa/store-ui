import type { Product } from "../types/product";
import PageHeading from "./PageHeading";
import ProductListings from "./ProductListings";
import { useLoaderData } from "react-router-dom";

// Hooks
export default function Home() {
  const products = useLoaderData() as Product[];

  return (
    <div className="max-w-[1152px] mx-auto px-6 py-8">
      <PageHeading title="Explore Eazy Stickers!">
        Ajoutez une touche de créativité à votre espace avec notre large gamme 
        d'autocollants amusants et uniques. Parfaits pour toutes les occasions!
      </PageHeading>
      <ProductListings products={products} />
    </div>
  );
}
