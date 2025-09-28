import products from "../data/products";
import PageHeading from "./PageHeading";
import ProductListings from "./ProductListings";

export default function Home () {
    return (
    <div className="home-container">
      <PageHeading title="Explore Eazy Stickers!">
        Ajoutez une touche de créativité à votre espace avec notre large gamme 
        d'autocollants amusants et uniques. Parfaits pour toutes les occasions!
      </PageHeading>
      <ProductListings products={products}/>
    </div>
  );
}