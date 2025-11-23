// CORE USER TYPES POUR L'AUTHENTIFICATION 
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: number;
  username?: string;
  email?: string;
  name?: string;
  mobileNumber?: string;
  address?: Address;
  roles: string[];
  enabled: boolean;
  accountNonExpired: boolean;
  credentialsNonExpired: boolean;
  accountNonLocked: boolean;
}

export type UserRole = 
  | 'ROLE_USER' 
  | 'ROLE_ADMIN' 
  | 'ROLE_MODERATOR'
  | 'ROLE_MANAGER'
  | 'ROLE_OPS_ENG';

export interface UserProfile {
  id: number;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
}

// AUTH STATE & SESSION TYPES
export interface AuthState {
  user: User | null;
  jwtToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthStatus = 
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface UserSession {
  user: User;
  token: string;
  expiresAt: number;
  lastActivity: number;
}

export interface SessionOptions {
  rememberMe: boolean;
  duration: number;
}

// API REQUEST/RESPONSE TYPES
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

//message optionnel dans LoginResponse
export interface LoginResponse {
  message?: string;  // Rend optionnel
  user: User;
  jwtToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  mobileNumber?: string;
  name?: string;
}

export interface RegisterResponse {
  status: 'SUCCESS' | 'ERROR';
  message: string;
  data?: {
    userId: number;
    username: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// FORM TYPES
export interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPwd: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ERROR & VALIDATION TYPES
export interface FormErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
  confirmPwd?: string;
  general?: string;
  [key: string]: string | undefined;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
  confirmPwd?: string;
  general?: string;
}

export interface ActionData {
  success?: boolean;
  errors?: FormErrors;
  message?: string;
  user?: User;
  jwtToken?: string;
}

// LoginActionResponse avec son propre type
export interface LoginActionResponse extends ActionData {
  user?: User;
  jwtToken?: string;
}

// RegisterActionResponse avec des champs spécifiques
export interface RegisterActionResponse extends ActionData {
  // Ajout de champs spécifiques à l'inscription
  userId?: number;
  requiresEmailVerification?: boolean;
}

// TOKEN & PERMISSION TYPES
export interface JwtClaims {
  sub?: string;
  userId?: number;
  username?: string;
  email?: string;
  name?: string;
  mobileNumber?: string;
  roles?: string | string[];
  exp?: number;
  iat?: number;
  iss?: string;
}

export type TokenStatus = 
  | 'valid'
  | 'expired'
  | 'invalid'
  | 'missing';

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export type PermissionCheck = (permission: Permission) => boolean;

// HELPER TYPES
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

export interface FieldValidation {
  isValid: boolean;
  error?: string;
}

// COMPONENT PROP TYPES
export interface LoginFormProps {
  actionData?: LoginActionResponse;
  isLoading?: boolean;
  redirectTo?: string;
}

export interface RegisterFormProps {
  actionData?: RegisterActionResponse;
  isLoading?: boolean;
}

export interface ForgotPasswordFormProps {
  actionData?: ActionData;
  isLoading?: boolean;
}

export interface RegisterActionResponse {
  success: boolean;
  message?: string;
  errors?: {
    name?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    general?: string;
    [key: string]: string | undefined;
  };
}

// UTILITY FUNCTIONS
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Utilisateur';
  return user.name || user.username || user.email || 'Utilisateur';
}

export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user || !user.roles) return false;
  return roles.some(role => user.roles.includes(role));
}

export function hasCompleteAddress(user: User | null): boolean {
  if (!user || !user.address) return false;
  const { street, city, state, postalCode, country } = user.address;
  return !!(street && city && state && postalCode && country);
}

export function isUserAdmin(user: User | null): boolean {
  return hasRole(user, 'ROLE_ADMIN');
}