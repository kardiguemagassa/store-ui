import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,  // Gère le panier
    auth: authReducer, // Gère l'authentification
  },
  
  // Désactive certaines vérifications pour éviter des erreurs techniques, 
  // surtout si tu utilises Redux Persist plus tard
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['register'],
      },
    }),
});

// SUPPRIMEZ complètement store.subscribe() 
// La persistance est gérée dans chaque slice

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;