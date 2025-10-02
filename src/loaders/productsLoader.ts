import apiClient from "../api/apiClient";
import type { Product } from "../types/product";

// Loader function pour React Router
// Cette fonction est appelée AVANT le rendu du composant Home
// Elle charge les données des produits depuis l'API de manière asynchrone
// Le type de retour Promise<Product[]> garantit qu'on retourne bien un tableau de produits
export async function productsLoader(): Promise<Product[]> {
  try {
    // Requête GET vers l'API backend
    // apiClient.get<Product[]> : le <Product[]> est un type générique TypeScript
    // qui indique à Axios le format attendu de response.data
    // "/products" est ajouté à la baseURL définie dans apiClient (http://localhost:8080/api/v1)
    // URL complète : http://localhost:8080/api/v1/products
    const response = await apiClient.get<Product[]>("/products");
    
    // Log de debug pour vérifier les données reçues
    // Visible dans la console du navigateur (F12 > Console)
    console.log("Products loaded:", response.data);
    
    // Retourne les données au composant qui utilise useLoaderData()
    // React Router met automatiquement ces données en cache
    return response.data;
    
  } catch (error: unknown) {
    // Bloc catch : gère toutes les erreurs possibles
    // error: unknown : TypeScript force à typer explicitement pour la sécurité
    console.error("Failed to load products:", error);
    
    // Messages d'erreur par défaut
    // Ces valeurs seront utilisées si on ne peut pas extraire d'info de l'erreur
    let errorMessage = "Failed to fetch products. Please try again.";
    let errorStatus = 500; // Code HTTP 500 = Internal Server Error
    
    // Type narrowing : vérification progressive du type d'erreur
    // TypeScript ne sait pas automatiquement quel type d'erreur on a attrapé
    
    // Première vérification : est-ce un objet avec une propriété "response" ?
    // Cela correspond aux erreurs Axios (erreurs HTTP de l'API)
    if (error && typeof error === "object" && "response" in error) {
      // Cast TypeScript : on indique explicitement la structure de l'erreur Axios
      // axiosError.response existe quand le serveur a répondu (même avec erreur 4xx, 5xx)
      // axiosError.message existe toujours (erreur réseau, timeout, etc.)
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      
      // Extrait le message d'erreur (si disponible, sinon garde le message par défaut)
      errorMessage = axiosError.message || errorMessage;
      
      // Extrait le code HTTP (404, 500, etc.) si le serveur a répondu
      // à afficher erreur de backend ====================>
      errorStatus = axiosError.response?.status || errorStatus;
      
    // Deuxième vérification : est-ce une erreur JavaScript standard ?
    // Exemple : new Error("Something went wrong")
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // 🚨 Throw d'une Response : format spécial pour React Router
    // throw new Response() : déclenche l'errorElement défini dans les routes
    // React Router capte cette erreur et affiche ErrorPage.tsx
    // { status: errorStatus } : permet à ErrorPage de savoir quel type d'erreur (404, 500, etc.)
    throw new Response(errorMessage, { status: errorStatus });
  }
}