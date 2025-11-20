import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from '../../../shared/store/store';


//import type { RootState, AppDispatch } from '../features/auth/store';

/**
 * Hook dispatch typé pour Redux avec TypeScript
 * @returns {AppDispatch} Le dispatch typé du store
 * 
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(addToCart({ product, quantity: 1 }));
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Hook selector typé pour Redux avec TypeScript
 * Permet d'accéder au state global avec un typage fort
 * 
 * @example
 * const cartItems = useAppSelector(selectCartItems);
 * const totalQuantity = useAppSelector(selectTotalQuantity);
 * const user = useAppSelector(state => state.auth.user);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;