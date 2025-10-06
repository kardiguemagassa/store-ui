import { useReducer, useEffect, type ReactNode, useRef, useCallback } from "react";
import { AuthContext } from "./auth-context";
import type { User, AuthContextType } from "../types/auth";

// Action types
type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { jwtToken: string; user: User } }
  | { type: "LOGOUT" }
  | { type: "INIT_FROM_STORAGE"; payload: { jwtToken: string; user: User } };

// Reducer
const authReducer = (state: Omit<AuthContextType, "loginSuccess" | "logout">, action: AuthAction) => {
  switch (action.type) {
    case "INIT_FROM_STORAGE":
    case "LOGIN_SUCCESS":
      return { 
        jwtToken: action.payload.jwtToken, 
        user: action.payload.user, 
        isAuthenticated: true 
      };
    case "LOGOUT":
      return { 
        jwtToken: null, 
        user: null, 
        isAuthenticated: false 
      };
    default:
      return state;
  }
};

// Provider
interface AuthProviderProps { 
  children: ReactNode 
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const initialState: Omit<AuthContextType, "loginSuccess" | "logout"> = {
    jwtToken: null,
    user: null,
    isAuthenticated: false
  };

  const [state, dispatch] = useReducer(authReducer, initialState);
  const isInitialized = useRef(false);

  // Charger depuis localStorage UNE SEULE FOIS
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        const userStr = localStorage.getItem("user");
        
        if (jwtToken && userStr) {
          const user = JSON.parse(userStr);
          dispatch({ type: "INIT_FROM_STORAGE", payload: { jwtToken, user } });
        }
      } catch (error) {
        console.error("Error loading auth from localStorage:", error);
      }
      isInitialized.current = true;
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    if (!isInitialized.current) return;

    if (state.isAuthenticated && state.jwtToken && state.user) {
      localStorage.setItem("jwtToken", state.jwtToken);
      localStorage.setItem("user", JSON.stringify(state.user));
    } else if (!state.isAuthenticated) {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
    }
  }, [state.isAuthenticated, state.jwtToken, state.user]);

  // ✅ useCallback pour stabiliser les fonctions
  const loginSuccess = useCallback((jwtToken: string, user: User) => {
    dispatch({ type: "LOGIN_SUCCESS", payload: { jwtToken, user } });
  }, []);
  
  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      jwtToken: state.jwtToken, 
      user: state.user, 
      isAuthenticated: state.isAuthenticated, 
      loginSuccess, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
