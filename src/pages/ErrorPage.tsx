import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import PageTitle from "../shared/components/PageTitle";
import Footer from "../shared/components/Footer";
import Header from "../shared/components/Header";
import { handleApiError, logger } from "../shared/types/errors.types";

export default function ErrorPage() {
  // Récupère l'erreur capturée par React Router
  const error = useRouteError();
  
  // Gestion centralisée des erreurs
  const errorInfo = handleApiError(error);
  
  // Messages par défaut maintenant centralisés
  let errorTitle = "Un problème est survenu.";
  let errorMessage = errorInfo.message; 
  
  // GESTION SPÉCIFIQUE POUR LES ERREURS REACT ROUTER
  // Cas 1 : Erreur de type Response throw new Response
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

  // Log erreur
  logger.error("Erreur capturée par ErrorPage", "ErrorPage", error, {
    errorType: isRouteErrorResponse(error) ? "route_response" : 
               error instanceof Error ? "javascript_error" : 
               typeof error === "string" ? "string_error" : "unknown",
    statusCode: isRouteErrorResponse(error) ? error.status : undefined,
    errorTitle,
    errorMessage: errorMessage.substring(0, 100) // Limiter la longueur du log
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
            
            <div className="w-full max-w-[576px] mx-auto mb-6 flex justify-center">
              <div className="text-8xl text-gray-300 dark:text-gray-600 mb-4">⚠️</div>
            </div>
            
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