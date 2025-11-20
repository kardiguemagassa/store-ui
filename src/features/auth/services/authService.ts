import apiClient from '../../../shared/api/apiClient';
import { handleApiError, type ApiError } from '../../../shared/types/errors.types';
import type { 
  User, 
  LoginCredentials, 
  LoginResponse, 
  RegisterData, 
  RegisterResponse,
  LoginActionResponse,
  RegisterActionResponse 
} from '../types/auth.types';

// Types locaux pour le service
interface UserAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// AUTH SERVICE
class AuthService {
  
  //LOGIN - Détection automatique du format backend
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Login attempt for:', credentials.username);
      
      const response = await apiClient.post<unknown>('/auth/login', credentials);
      console.log('🔍 Raw login response:', response.data);
      
      return this.processLoginResponse(response.data);
      
    } catch (error: unknown) {
      console.error('Login failed:', handleApiError(error));
      throw error;
    }
  }

//TRAITEMENT COMMUN DES RÉPONSES LOGIN
// TRAITEMENT COMMUN DES RÉPONSES LOGIN
private processLoginResponse(responseData: unknown): LoginResponse {
  if (typeof responseData !== 'object' || responseData === null) {
    throw new Error('Réponse invalide du serveur');
  }

  const data = responseData as Record<string, unknown>;
  
  console.log('🔍 Response data keys:', Object.keys(data));
  console.log('🔍 Response data:', JSON.stringify(data, null, 2));

  // FORMAT 1: ApiResponse wrappée
  if ('data' in data && typeof data.data === 'object' && data.data !== null) {
    const loginData = data.data as Record<string, unknown>;
    
    console.log('🔍 LoginData keys:', Object.keys(loginData));
    console.log('🔍 Has jwtToken:', 'jwtToken' in loginData);
    console.log('🔍 Has user:', 'user' in loginData);
    
    // Vérification plus robuste
    if ('jwtToken' in loginData && 'user' in loginData && loginData.user) {
      console.log('Format LoginResponseDto (ApiResponse wrappée) détecté');
      
      const userData = loginData.user as Record<string, unknown>;
      const jwtToken = loginData.jwtToken as string;
      const refreshToken = (loginData.refreshToken as string) || '';
      const expiresIn = (loginData.expiresIn as number) || 900;
      
      console.log('🔍 User data:', JSON.stringify(userData, null, 2));
      console.log('🔍 JWT token length:', jwtToken?.length);
      
      // Extraire l'ID depuis userData
      const userId = (userData.customerId as number) || 
                     (userData.id as number) || 
                     (userData.userId as number) || 
                     0;
      
      //Extraction des rôles 
let roles: string[] = ['ROLE_USER'];

if (userData.roleSet && Array.isArray(userData.roleSet)) {
  const firstItem = userData.roleSet[0];
  
  // Si c'est un array de strings simples
  if (typeof firstItem === 'string') {
    roles = userData.roleSet as string[];
  } 
  // Si c'est un array d'objets complexes
  else if (typeof firstItem === 'object' && firstItem !== null) {
    roles = (userData.roleSet as Array<{name?: {name?: string}}>).map(role => {
      const roleName = role.name?.name || 'USER';
      return roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    });
  }
} else if (userData.roles) {
  // Format: "ROLE_ADMIN,ROLE_USER" ou ["ROLE_ADMIN", "ROLE_USER"]
  if (typeof userData.roles === 'string') {
    roles = userData.roles.split(',').map(r => r.trim());
  } else if (Array.isArray(userData.roles)) {
    roles = userData.roles as string[];
  }
}

console.log('🔍 Extracted roles:', roles);
      
      // Construction de l'objet User
      const user: User = {
        id: userId,
        username: (userData.email as string) || (userData.username as string) || '',
        email: (userData.email as string) || '',
        name: (userData.name as string) || '',
        mobileNumber: (userData.mobileNumber as string) || '',
        roles: roles,
        enabled: true,
        accountNonExpired: true,
        credentialsNonExpired: true,
        accountNonLocked: true,
        address: userData.address as UserAddress | undefined
      };

      console.log('User object created:', {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      });
      
      console.log('JWT token:', jwtToken.substring(0, 20) + '...');

      const result: LoginResponse = {
        message: (loginData.message as string) || 'Connexion réussie',
        user,
        jwtToken,
        refreshToken,
        expiresIn
      };
      
      console.log('LoginResponse ready:', {
        hasUser: !!result.user,
        hasJwt: !!result.jwtToken,
        jwtLength: result.jwtToken.length,
        userRoles: result.user.roles
      });

      return result;
    }
  }
  
  // FORMAT INCONNU
  console.error('Format de réponse non supporté');
  console.error('Data received:', JSON.stringify(data, null, 2));
  throw new Error('Format de réponse non supporté');
}

  // REGISTER - Inscription utilisateur
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      console.log('📝 Registration attempt for:', data.email);
     
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      console.log('Registration successful');
      
      return response.data;
      
    } catch (error: unknown) {
      console.error('Registration failed:', handleApiError(error));
      throw error;
    }
  }

  // REGISTER ACTION - Pour compatibilité React Router
  async registerAction(registerData: {name: string; email: string;mobileNumber: string;password: string;}): 
  Promise<RegisterActionResponse> {
    try {
      const response = await this.register({
        username: registerData.email,
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        mobileNumber: registerData.mobileNumber
      });
      
      return {
        success: true,
        message: response.message || "Inscription réussie!"
      };
      
    } catch (error: unknown) {
      return this.handleRegisterError(error);
    }
  }

  // LOGOUT - Déconnexion 
  async logout(): Promise<void> {
    try {
      console.log('Logout attempt');
      await apiClient.post('/auth/logout', {});
      console.log('Logout successful');
      
    } catch (error: unknown) {
      console.error('Logout failed:', handleApiError(error));
      throw error;
    }
  }

  /**
   * LOGIN ACTION - Pour compatibilité React Router
   */
  async loginAction(credentials: LoginCredentials): Promise<LoginActionResponse> {
    try {
      const response = await this.login(credentials);
      
      return {
        success: true,
        message: "Connexion réussie!",
        user: response.user,
        jwtToken: response.jwtToken
      };
      
    } catch (error: unknown) {
      return this.handleAuthError(error);
    }
  }

  // GESTION CENTRALISÉE DES ERREURS AUTH - VERSION AMÉLIORÉE
  private handleAuthError(error: unknown): LoginActionResponse {
    const errorInfo = handleApiError(error);
    const apiError = error as ApiError;
    const status = apiError.response?.status;

    console.log('🔍 Detailed error response:', apiError.response?.data);

    // EXTRACTION DES ERREURS DE VALIDATION DÉTAILLÉES
    if (status === 400) {
      const responseData = apiError.response?.data;
      
      // Si le backend envoie les erreurs détaillées par champ
      if (responseData && typeof responseData === 'object' && 'errors' in responseData) {
        const validationErrors = responseData.errors as Record<string, string>;
        
        console.log('🔍 Validation errors by field:', validationErrors);
        
        // EXTRACTION DES MESSAGES SPÉCIFIQUES
        if (validationErrors.password) {
          return {
            success: false,
            errors: { 
              password: this.translatePasswordError(validationErrors.password),
              general: "Veuillez corriger les erreurs du formulaire"
            }
          };
        }
        
        if (validationErrors.username || validationErrors.email) {
          return {
            success: false,
            errors: { 
              email: "Format d'email invalide",
              general: "Veuillez corriger les erreurs du formulaire"
            }
          };
        }
        
        // Si d'autres erreurs de validation
        const firstError = Object.values(validationErrors)[0];
        return {
          success: false,
          errors: { 
            general: firstError || "Données de formulaire invalides"
          }
        };
      }
      
      // GESTION DES ERREURS DE MOT DE PASSE SPÉCIFIQUES
      // Basé sur les logs Spring
      // - Taille : "Le mot de passe doit contenir entre 8 et 128 caractères"
      // - Pattern : "Doit contenir majuscule, minuscule, chiffre, caractère spécial"
      return {
        success: false,
        errors: { 
          password: "Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&#)",
          general: "Mot de passe invalide"
        }
      };
    }

    // ERREUR 401 - IDENTIFIANTS INCORRECTS
    if (status === 401) {
      return {
        success: false,
        errors: { general: "Email ou mot de passe incorrect" }
      };
    }

    // ✅ ERREUR GÉNÉRIQUE
    return {
      success: false,
      errors: { 
        general: errorInfo.message || "Erreur de connexion. Veuillez réessayer."
      }
    };
  }

  // Traduit les erreurs de mot de passe spécifiques
  private translatePasswordError(passwordError: string): string {
    console.log('🔍 Password error to translate:', passwordError);
    
    // DÉTECTION DES ERREURS SPÉCIFIQUES
    if (passwordError.includes('8') && passwordError.includes('128')) {
      return "Le mot de passe doit contenir entre 8 et 128 caractères";
    }
    
    if (passwordError.includes('majuscule') || 
        passwordError.includes('minuscule') || 
        passwordError.includes('chiffre') || 
        passwordError.includes('caractère spécial')) {
      return "Le mot de passe doit contenir au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&#)";
    }
    
    if (passwordError.includes('taille') || passwordError.includes('size')) {
      return "Le mot de passe doit contenir entre 8 et 128 caractères";
    }
    
    if (passwordError.includes('pattern') || passwordError.includes('format')) {
      return "Format de mot de passe invalide";
    }
    
    // RETOURNER LE MESSAGE ORIGINAL SI NON RECONNU
    return passwordError;
  }

  //GESTION DES ERREURS D'INSCRIPTION
  private handleRegisterError(error: unknown): RegisterActionResponse {
    const errorInfo = handleApiError(error);
    const apiError = error as ApiError;
    const status = apiError.response?.status;

    // Messages d'erreur spécifiques à l'inscription
    if (status === 400) {
      return {
        success: false,
        errors: { 
          general: "Données d'inscription invalides",
          ...errorInfo.errors 
        }
      };
    }

    if (status === 409) {
      return {
        success: false,
        errors: { 
          general: "Un compte existe déjà avec cet email",
          email: "Cet email est déjà utilisé"
        }
      };
    }

    return {
      success: false,
      errors: { 
        general: errorInfo.message || "Erreur lors de l'inscription",
        ...errorInfo.errors 
      }
    };
  }

  // Vérifie si le JWT est expiré
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      
      if (!exp) return true;
      
      return Date.now() >= (exp * 1000) - 30000;
      
    } catch (error: unknown) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

 // Extrait les informations utilisateur du JWT
  getUserFromToken(token: string): User {
    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const claims = JSON.parse(decodedPayload) as Record<string, unknown>;
      
      return {
        id: (claims.userId as number) || parseInt((claims.sub as string) || '0', 10),
        name: (claims.name as string) || (claims.username as string) || 'Unknown',
        email: claims.email as string,
        username: (claims.username as string) || (claims.sub as string) || '',
        mobileNumber: claims.mobileNumber as string,
        roles: this.parseRoles(claims.roles),
        enabled: true,
        accountNonExpired: true,
        credentialsNonExpired: true,
        accountNonLocked: true
      };
      
    } catch (error: unknown) {
      console.error('Failed to decode JWT:', error);
      throw new Error('Invalid JWT token');
    }
  }

  //Parse les rôles depuis le JWT
  private parseRoles(roles: unknown): string[] {
    if (!roles) return ['ROLE_USER'];
    
    if (Array.isArray(roles)) return roles as string[];
    
    if (typeof roles === 'string') {
      if (roles.startsWith('[')) {
        try {
          return JSON.parse(roles);
        } catch {
          return roles.split(',').map(role => role.trim().replace(/["']/g, ''));
        }
      }
      return roles.split(',').map(role => role.trim());
    }
    
    return ['ROLE_USER'];
  }
}

export const authService = new AuthService();
export default authService;