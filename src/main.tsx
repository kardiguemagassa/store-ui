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
//import { productDetailLoader } from './loaders/productDetailLoader.ts';
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
import { profileLoader } from './loaders/profileLoader.ts';
import { profileAction } from './actions/profileAction.ts';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import OrderSuccess from './components/OrderSuccess.tsx';
import { productDetailLoader } from './loaders/productDetailLoader.ts';
import { ordersLoader } from './loaders/ordersLoader.ts';
import { adminOrdersLoader } from './loaders/adminOrdersLoader.ts';
import { messagesLoader } from './loaders/messagesLoader.ts';
//import OrderSuccess from "./components/OrderSuccess.jsx";


const stripePromise = loadStripe(
  "pk_test_51OhtIUDWbglQHB6CdSDFxtaP6MtNj16Ul1mpyARfmYpFWv9cWn7VXf72D4EUSnkBDzIoBoFhXGB45954dzle1M6g00fni1jV40"
);


// Cette approche utilise la syntaxe JSX pour définir les routes (alternative à l'objet JavaScript)
const routeDefinitions = createRoutesFromElements(
  
  <Route path="/" element={<App />} errorElement={<ErrorPage />}>

    <Route index element={<Home />} loader={productsLoader} />
    <Route path="/home" element={<Home />} loader={productsLoader} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} action={contactAction} />
    
    <Route path="/login" element={<Login />} action={loginAction} />
    <Route path="/register" element={<Register />} action={registerAction} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/products/:productId" element={<ProductDetail />} 
    loader={productDetailLoader}  
    />

    <Route
        path="/profile"
        element={<Profile />}
        loader={profileLoader}
        action={profileAction}
        shouldRevalidate={({ actionResult }) => {
          return !actionResult?.success;
        }}
      />

    <Route element={<ProtectedRoute />}>
      <Route path="/checkout" element={<CheckoutForm />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/orders" element={<Orders />} loader={ordersLoader} />
      <Route path="/admin/orders"element={<AdminOrders />}loader={adminOrdersLoader}/>
      <Route path="/admin/messages"element={<Messages />} loader={messagesLoader}/>
    </Route>
  </Route>
);


const appRouter = createBrowserRouter(routeDefinitions);

createRoot(document.getElementById('root')!).render(

  <StrictMode>

    <Elements stripe={stripePromise}>

    <AuthProvider>
        <CartProvider>
          <RouterProvider router={appRouter} />
        </CartProvider>
      </AuthProvider>
      
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