import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Home from './components/Home.tsx';
import About from './components/About.tsx';
import Contact from './components/Contact.tsx';
import Login from './components/Login.tsx';
import { contactAction } from './actions/contactAction.ts';
import ErrorPage from './components/ErrorPage.tsx';
import { Bounce, ToastContainer } from 'react-toastify';
import Cart from './components/Cart.tsx';
import { productsLoader } from './loaders/productsLoader.ts';
import ProductDetail from './components/ProductDetail.tsx';
import { productDetailLoader } from './loaders/productDetailLoader.ts';
//import { CartProvider } from './store/cart-context.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { loginAction } from './actions/loginAction.ts';
import { AuthProvider } from './context/AuthProvider.tsx';
import CheckoutForm from './components/CheckoutForm.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import Orders from './components/Orders.tsx';
import AdminOrders from './components/admin/AdminOrders.tsx';
import Messages from './components/admin/Messages.tsx';
import Profile from './components/Profile.tsx';
import Register from './components/Register.tsx';
import { registerAction } from './actions/registerAction.ts';

// 🗺️ Définition des routes avec createRoutesFromElements
// Cette approche utilise la syntaxe JSX pour définir les routes (alternative à l'objet JavaScript)
const routeDefinitions = createRoutesFromElements(
  // Route parent "/" : contient le layout (Header + Footer dans App.tsx)
  // errorElement : composant affiché en cas d'erreur dans n'importe quelle route enfant
  <Route path="/" element={<App />} errorElement={<ErrorPage />}>
    
    {/* index : route par défaut quand on est sur "/" (équivalent à path="/") */}
    {/* loader : fonction appelée AVANT le rendu pour charger les données */}
    <Route index element={<Home />} loader={productsLoader} />
    
    {/* Route explicite /home (doublon avec index, utile pour la navigation) */}
    <Route path="/home" element={<Home />} loader={productsLoader} />
    
    {/* Routes simples sans loader ni action */}
    <Route path="/about" element={<About />} />
    
    {/* action : fonction appelée lors de la soumission d'un formulaire */}
    {/* Utilisé pour traiter les données du formulaire de contact */}
    <Route path="/contact" element={<Contact />} action={contactAction} />
    
    <Route path="/login" element={<Login />} action={loginAction} />
    <Route path="/register" element={<Register />} action={registerAction} />
    <Route path="/cart" element={<Cart />} />
    
    
    {/* Route dynamique avec paramètre :productId */}
    {/* Exemple : /products/123 → productId = "123" */}
    {/* Accessible via useParams() dans ProductDetail.tsx */}
    <Route path="/products/:productId" element={<ProductDetail />} 
     loader={productDetailLoader}  
    />

    <Route element={<ProtectedRoute />}>
      <Route path="/checkout" element={<CheckoutForm />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/messages" element={<Messages />} />
    </Route>
  </Route>
);

// 🚀 Création du routeur avec les définitions de routes
// createBrowserRouter : utilise l'API History du navigateur (URLs propres sans #)
const appRouter = createBrowserRouter(routeDefinitions);

// 🎬 Point d'entrée de l'application React
// createRoot : API React 18 pour le rendu de l'application
// getElementById('root')! : le "!" indique à TypeScript que l'élément existe (non-null assertion)
createRoot(document.getElementById('root')!).render(

  // StrictMode : mode strict de React (détecte les problèmes potentiels en dev)
  // - Rend les composants 2 fois pour détecter les effets de bord
  // - Active des warnings supplémentaires
  // - N'affecte PAS la production
  <StrictMode>


   <AuthProvider>
      <CartProvider>
        <RouterProvider router={appRouter} />
      </CartProvider>
    </AuthProvider>
    
    {/* RouterProvider : fournit le contexte de routing à toute l'application */}
    {/* Permet à tous les composants d'utiliser useNavigate, useParams, etc. */}
    
    {/* ToastContainer : conteneur pour les notifications toast (react-toastify) */}
    {/* position : où apparaissent les toasts sur l'écran */}
    <ToastContainer
      position="top-center"
      
      /* autoClose : fermeture automatique après 3 secondes */
      autoClose={3000}
      
      /* hideProgressBar : affiche la barre de progression du timer */
      hideProgressBar={false}
      
      /* newestOnTop : les nouveaux toasts apparaissent en haut de la pile */
      newestOnTop={false}
      
      /* draggable : permet de glisser les toasts pour les fermer */
      draggable
      
      /* pauseOnHover : pause le timer quand on survole le toast */
      pauseOnHover
      
      /* theme : adapte le toast au thème dark/light de l'utilisateur */
      /* Lit la préférence sauvegardée dans localStorage */
      theme={localStorage.getItem("theme") === "dark" ? "dark" : "light"}
      
      /* transition : animation d'entrée/sortie des toasts */
      transition={Bounce}
    />
  </StrictMode>
)