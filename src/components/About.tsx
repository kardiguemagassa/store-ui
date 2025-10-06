import PageTitle from "./PageTitle";

// Page About : présentation de l'entreprise et ses valeurs
export default function About() {
  // Styles réutilisables pour uniformité visuelle
  const h3Style = "text-lg font-semibold text-primary dark:text-light mb-2";
  const pStyle = "text-gray-600 dark:text-lighter";

  return (
    <div className="max-w-[1152px] min-h-[852px] mx-auto px-6 py-8 font-primary">
      <PageTitle title="À propos de nous" />
      
      {/* Introduction de l'entreprise */}
      <p className="leading-6 mb-8 text-gray-600 dark:text-lighter">
        {/* Mise en évidence des noms de marque avec style différent */}
        <span className="text-lg font-semibold text-primary dark:text-light">
          autocollant facile
        </span>{" "}
        magasin est une initiative de {" "}
        <span className="text-lg font-semibold text-primary dark:text-light">
          Conceptions par eazybytes
        </span>
        , dédié à vous offrir les stickers et posters les plus recherchés !
      </p>

      {/* Titre de section */}
      <h2 className="text-2xl leading-[32px] font-bold text-primary dark:text-light mb-6">
        Pourquoi nous choisir?
      </h2>

      {/* Liste des caractéristiques */}
      {/* space-y-8 : espacement vertical uniforme entre chaque feature */}
      <div className="space-y-8">
        
        {/* Feature 1 : Qualité premium */}
        <div>
          <h3 className={h3Style}>Qualité supérieure</h3>
          <p className={pStyle}>
            Nous nous efforçons d'offrir à chaque client la plus grande satisfaction 
            en livrant des autocollants en vinyle de haute qualité fabriqués avec soin et précision.
          </p>
        </div>

        {/* Feature 2 : Innovation produit */}
        <div>
          <h3 className={h3Style}>Innovation produit</h3>
          <p className={pStyle}>
            Nos autocollants en vinyle bénéficient d'une finition mate ou brillante 
            de qualité supérieure et sont fabriqués avec une technologie adhésive avancée. 
            Conçus pour résister aux intempéries et aux rayures, 
            nos autocollants sont suffisamment doux pour préserver 
            la surface de vos précieux appareils.
          </p>
        </div>

        {/* Feature 3 : Service client */}
        <div>
          <h3 className={h3Style}>Excellent service</h3>
          <p className={pStyle}>
            La satisfaction de nos clients est notre priorité absolue et nous 
            nous engageons à offrir une expérience d'achat exceptionnelle.
          </p>
        </div>

        {/* Feature 4 : Variété de designs */}
        <div>
          <h3 className={h3Style}>Des designs que vous allez adorer</h3>
          <p className={pStyle}>
            Avec plus de 1000 modèles, notre collection s'étend des plus 
            pertinents et drôles aux plus délicieusement décalés. Et ce n'est qu'un début
            ! Restez connectés pour découvrir d'autres produits et modèles passionnants!
          </p>
        </div>
      </div>
    </div>
  );
}