import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {createBrowserRouter,RouterProvider,createRoutesFromElements,Route,} from "react-router-dom";
import { useEffect } from 'react';
import apiClient from './shared/api/apiClient';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
import Login from './features/auth/pages/Login.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import { Bounce, ToastContainer } from 'react-toastify';
import Cart from './features/cart/pages/Cart.tsx';
import CheckoutForm from './features/payment/pages/CheckoutForm.tsx';
import ProtectedRoute from './features/auth/components/ProtectedRoute.tsx';
import Orders from './features/orders/pages/Orders.tsx';
import AdminOrders from './features/orders/pages/AdminOrders.tsx';
import Profile from './features/profile/pages/Profile.tsx';
import Register from './features/auth/pages/Register.tsx';
import { Elements } from "@stripe/react-stripe-js";
import OrderSuccess from './features/orders/pages/OrderSuccess.tsx';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Users from './features/users/pages/Users.tsx';
import ProductUpload from './features/products/pages/admin/ProductUpload.tsx';
import AdminProducts from './features/products/pages/admin/AdminProducts.tsx';
import EditProduct from './features/products/pages/admin/EditProduct.tsx';
import { store, persistor } from './shared/store/store.ts'; 
import ContactPage from './features/contacts/pages/ContactPage.tsx';
import { contactAction, contactInfoLoader, messagesLoader } from './features/contacts/services/contactService.ts';
import AdminMessagesPage from './features/contacts/pages/ AdminMessagesPage.tsx';
import { adminOrdersLoader, customerOrdersPaginatedLoader } from './features/orders/services/orderService.ts';
import { usersLoader } from './features/users/services/userService.ts';
import { profileAction, profileLoader } from './features/profile/services/profileService.ts';
import ProductGalleryPage from './features/products/pages/admin/ProductGalleryPage.tsx';
import ProductDetail from './features/products/pages/public/ProductDetail.tsx';
import { productLoader } from './features/products/loaders/productLoader.ts';
import { logger } from './shared/types/errors.types.ts';
import { stripePromise } from './config/tripe.ts';

// COMPOSANT WRAPPER POUR INITIALISATION CSRF token
// eslint-disable-next-line react-refresh/only-export-components
function AppWrapper() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('Initializing CSRF token...', 'AppWrapper');
        await apiClient.get('/csrf-token');
        logger.info('CSRF token initialized successfully', 'AppWrapper');
      } catch (error) {
        logger.error('CSRF initialization failed', 'AppWrapper', error);
        // Retry après 2 secondes en cas d'échec
        setTimeout(() => initializeApp(), 2000);
      }
    };

    initializeApp();
  }, []);

  return <App />;
}


// Cette approche utilise la syntaxe JSX pour définir les routes (alternative à l'objet JavaScript)
const routeDefinitions = createRoutesFromElements(
  
  <Route path="/" element={<AppWrapper />} errorElement={<ErrorPage />}>
    <Route index element={<Home />} />

    <Route path="/home" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<ContactPage />} action={contactAction}loader={contactInfoLoader}/>
    <Route path="/products/:productId" element={<ProductDetail />} loader={productLoader}/>
    
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/cart" element={<Cart />} />

    <Route path="/profile" element={<Profile />}loader={profileLoader}action={profileAction}
            shouldRevalidate={({ actionResult }) => {
          return !actionResult?.success;
        }}
      />
      
    <Route element={<ProtectedRoute />}>
      <Route path="/checkout" element={<CheckoutForm />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/orders" element={<Orders />} loader={customerOrdersPaginatedLoader} />

      <Route path="/admin/orders"element={<AdminOrders />}loader={adminOrdersLoader}/>
      <Route path="/admin/messages" element={<AdminMessagesPage />} loader={messagesLoader}/>
      <Route path="/admin/users" element={<Users />} loader={usersLoader}/>
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/products/edit/:productId" element={<EditProduct />} /> 
      <Route path="/admin/products/upload" element={<ProductUpload />} />
      <Route path="/admin/products/:productId/gallery" element={<ProductGalleryPage />} />
    </Route>
  </Route>
);

const appRouter = createBrowserRouter(routeDefinitions);

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <Elements stripe={stripePromise}>

      <Provider store={store}>
        {/*PersistGate pour éviter la déconnexion au refresh */}
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={appRouter} />
        </PersistGate>
      </Provider>

      <ToastContainer
        position="top-center"
        
        //autoClose : fermeture automatique après 3 secondes
        autoClose={3000}
        //affiche la barre de progression du timer
        hideProgressBar={false}
        //nouveaux toasts apparaissent en haut de la pile 
        newestOnTop={false}
        // draggable : permet de glisser les toasts pour les fermer
        draggable
        //pauseOnHover : pause le timer quand on survole le toast
        pauseOnHover
        
        /* theme : adapte le toast au thème dark/light de l'utilisateur */
        /* Lit la préférence sauvegardée dans localStorage */
        theme={localStorage.getItem("theme") === "dark" ? "dark" : "light"}
        
        /* transition : animation d'entrée/sortie des toasts */
        transition={Bounce}
      />
    </Elements>
  </StrictMode>
)