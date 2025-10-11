import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import Header from "./Header";
import Footer from "./footer/Footer";
import PageTitle from "./PageTitle";
import errorImage from "../assets/util/error.png";
import { handleApiError } from "../types/errors";

export default function ErrorPage() {

  // Récupère l'erreur capturée par React Router
  const error = useRouteError();
  
  // ERREURS CENTRALISÉ
  const errorInfo = handleApiError(error);
  
  // Messages par défaut maintenant centralisés
  let errorTitle = "Un problème est survenu.";
  let errorMessage = errorInfo.message; 
  
  // GESTION SPÉCIFIQUE POUR LES ERREURS REACT ROUTER
  // Cas 1 : Erreur de type Responsethrow new response
  if (isRouteErrorResponse(error)) {
    errorTitle = `Erreur ${error.status}`;
    
    // PRIORITÉ AUX MESSAGES SPÉCIFIQUES DES LOADERS
    // Si le loader a passé un message personnalisé, on l'utilise
    // Sinon on utilise le message centralisé qui gère déjà les statuts HTTP
    errorMessage = error.data || errorInfo.message;
  } 
  // Cas 2 : Erreur JavaScript standard throw new Error
  else if (error instanceof Error) {
    errorTitle = "Erreur Application";
    // On garde le message original de l'erreur
    errorMessage = error.message;
  } 
  // Cas 3 : Erreur de type string throw message
  else if (typeof error === "string") {
    errorMessage = error;
  }

  console.log("Erreur capturée par ErrorPage:", {
    error,
    errorTitle,
    errorMessage,
    errorInfo
  });

  return (
    <div className="flex flex-col min-h-[980px]">
      <Header />
      <main className="flex-grow">
        <div className="py-12 bg-normalbg dark:bg-darkbg font-primary">
          
          <div className="max-w-4xl mx-auto px-4">
            <PageTitle title={errorTitle} />
          </div>
          <div className="text-center text-gray-600 dark:text-lighter flex flex-col items-center">
            <p className="max-w-[576px] px-2 mx-auto leading-6 mb-4">
              {errorMessage}
            </p>
            <img
              src={errorImage}
              alt="Error illustration"
              className="w-full max-w-[576px] mx-auto mb-6"
            />
            
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