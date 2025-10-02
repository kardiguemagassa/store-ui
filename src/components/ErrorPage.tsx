import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import Header from "./Header";
import Footer from "./footer/Footer";
import PageTitle from "./PageTitle";
import errorImage from "../assets/util/error.png";

export default function ErrorPage() {
  // Récupère l'erreur capturée par React Router
  // Peut être de différents types : Response, Error, string, etc.
  const error = useRouteError();
  
  // Messages par défaut
  let errorTitle = "Un problème est survenu.";
  let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer ultérieurement.";
  
  // Type narrowing : identifie le type d'erreur pour afficher le bon message
  
  // Cas 1 : Erreur de type Response (throw new Response(...))
  // Provient généralement des loaders/actions React Router
  if (isRouteErrorResponse(error)) {
    errorTitle = `Error ${error.status}`; // Ex: "Error 404"
    // error.data : message personnalisé passé dans new Response()
    // error.statusText : message HTTP standard (ex: "Not Found")
    errorMessage = error.data || error.statusText || errorMessage;
  } 
  // Cas 2 : Erreur JavaScript standard (throw new Error(...))
  else if (error instanceof Error) {
    errorTitle = "Application Error";
    errorMessage = error.message;
  } 
  // Cas 3 : Erreur de type string (throw "message")
  else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    // flex flex-col : disposition verticale (Header → Main → Footer)
    // min-h-[980px] : hauteur minimale pour éviter un footer qui remonte
    <div className="flex flex-col min-h-[980px]">
      <Header />
      
      {/* Main : flex-grow pour prendre tout l'espace disponible */}
      {/* Pousse le Footer vers le bas même avec peu de contenu */}
      <main className="flex-grow">
        <div className="py-12 bg-normalbg dark:bg-darkbg font-primary">
          
          {/* Container avec largeur maximale */}
          <div className="max-w-4xl mx-auto px-4">
            {/* Titre dynamique selon le type d'erreur */}
            <PageTitle title={errorTitle} />
          </div>
          
          {/* Contenu centré : message + image + bouton */}
          <div className="text-center text-gray-600 dark:text-lighter flex flex-col items-center">
            
            {/* Message d'erreur avec largeur limitée pour la lisibilité */}
            <p className="max-w-[576px] px-2 mx-auto leading-6 mb-4">
              {errorMessage}
            </p>
            
            {/* Illustration d'erreur */}
            {/* max-w-[576px] : même largeur que le texte pour cohérence visuelle */}
            <img
              src={errorImage}
              alt="Error illustration"
              className="w-full max-w-[576px] mx-auto mb-6"
            />
            
            {/* Bouton de retour à l'accueil */}
            <Link
              to="/home"
              className="py-3 px-6 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter font-semibold"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}