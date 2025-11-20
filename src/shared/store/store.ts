import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer, { loginSuccess, logout } from '../../features/auth/store/authSlice';
import cartReducer from '../../features/cart/store/cartSlice';
import { configureApiClientStore } from '../api/apiClient';
import { logger } from '../types/errors.types';

/**
 * REDUX STORE - VERSION 4.0 PROFESSIONNELLE
 * 
 * Store unique pour toute l'application avec:
 * - Auth (avec persistence user uniquement)
 * - Cart (avec persistence panier)
 * - Redux Persist configuré correctement
 * - API Client intégré
 * 
 * SÉCURITÉ:
 * - JWT jamais persisté (mémoire uniquement)
 * - User persisté pour éviter déconnexion au refresh
 * - Refresh token en cookie HttpOnly (géré par backend)
 * 
 * @version 4.0 (Backend Security Enhanced + Redux Persist)
 */


// REDUX PERSIST CONFIGURATION AVEC ROOT REDUCER (SANS PERSIST)


const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  // Ajouter d'autre store ici
});


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Persister le slice auth
  // On ne peut pas filtrer user directement ici, on le fera dans authSlice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// STORE CONFIGURATION

// Configuration du store avec middleware Redux Persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// Persistor pour Redux Persist
export const persistor = persistStore(store);

// TYPES TYPESCRIPT
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// CONFIGURATION API CLIENT

/**
 * Configure l'API client avec le store Redux
 * 
 * Permet à apiClient de:
 * - Lire le JWT depuis Redux
 * - Dispatcher loginSuccess() après refresh
 * - Dispatcher logout() si refresh échoue
 * 
 * IMPORTANT: Doit être fait APRÈS la création du store
 * pour éviter les circular dependencies
 */
configureApiClientStore(store, {
  loginSuccess,
  logout,
});

logger.info('Redux store created with persistence and API client configured');
