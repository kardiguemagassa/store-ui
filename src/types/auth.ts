export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  username?: string;
  mobileNumber: string;
  address?: Address;
  roles: string[]; 
  enabled?: boolean;
  accountNonExpired?: boolean;
  credentialsNonExpired?: boolean;
  accountNonLocked?: boolean;
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