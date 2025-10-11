// hooks/useAuth.ts
import { useAppDispatch, useAppSelector } from './redux';
import { 
  selectJwtToken, 
  selectUser, 
  selectIsAuthenticated, 
  selectAuthIsLoading,
  selectUserRoles,
  logout as logoutAction,
  updateUser as updateUserAction
} from '../store/authSlice';

/**
 * Hook personnalisé pour l'authentification avec Redux
 * Remplace l'ancien useAuth du Context
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  
  const jwtToken = useAppSelector(selectJwtToken);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const roles = useAppSelector(selectUserRoles);

  const logout = () => {
    dispatch(logoutAction());
  };

  const updateUser = (userData: Partial<typeof user>) => {
    if (userData) {
      dispatch(updateUserAction(userData));
    }
  };

  const isAdmin = roles.includes("ROLE_ADMIN");

  return {
    jwtToken,
    user,
    isAuthenticated,
    isLoading,
    roles,
    isAdmin,
    logout,
    updateUser,
  };
}