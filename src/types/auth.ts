export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  jwtToken?: string;
  errors?: { message: string };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  jwtToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loginSuccess: (jwtToken: string, user: User) => void;
  logout: () => void;
}
