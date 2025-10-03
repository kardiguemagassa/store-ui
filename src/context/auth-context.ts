import { createContext } from "react";
import type { User } from "../types/auth";

export interface AuthContextType {
  jwtToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loginSuccess: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
