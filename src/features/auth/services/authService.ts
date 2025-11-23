import apiClient from '../../../shared/api/apiClient';
import { handleApiError, type ApiError, logger } from '../../../shared/types/errors.types';
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
  
  // LOGIN - Détection automatique du format backend
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      logger.info('Tentative de connexion', 'AuthService.login', {
        username: credentials.username
      });
      
      const response = await apiClient.post<unknown>('/auth/login', credentials);
      logger.debug('Réponse de connexion brute reçue', 'AuthService.login', {
        responseData: response.data
      });
      
      return this.processLoginResponse(response.data);
      
    } catch (error: unknown) {
      logger.error('Échec de la connexion', 'AuthService.login', error);
      throw error;
    }
  }

  // TRAITEMENT COMMUN DES RÉPONSES LOGIN
  private processLoginResponse(responseData: unknown): LoginResponse {
    if (typeof responseData !== 'object' || responseData === null) {
      logger.error('Réponse serveur invalide', 'AuthService.processLoginResponse', {
        responseType: typeof responseData
      });
      throw new Error('Réponse invalide du serveur');
    }

    const data = responseData as Record<string, unknown>;
    
    logger.debug('Analyse de la réponse de connexion', 'AuthService.processLoginResponse', {
      dataKeys: Object.keys(data),
      dataStructure: data
    });

    // FORMAT 1: ApiResponse wrappée
    if ('data' in data && typeof data.data === 'object' && data.data !== null) {
      const loginData = data.data as Record<string, unknown>;
      
      logger.debug('Données de connexion analysées', 'AuthService.processLoginResponse', {
        loginDataKeys: Object.keys(loginData),
        hasJwtToken: 'jwtToken' in loginData,
        hasUser: 'user' in loginData
      });
      
      // Vérification plus robuste
      if ('jwtToken' in loginData && 'user' in loginData && loginData.user) {
        logger.info('Format LoginResponseDto détecté', 'AuthService.processLoginResponse');
        
        const userData = loginData.user as Record<string, unknown>;
        const jwtToken = loginData.jwtToken as string;
        const refreshToken = (loginData.refreshToken as string) || '';
        const expiresIn = (loginData.expiresIn as number) || 900;
        
        // Extraire l'ID depuis userData
        const userId = (userData.customerId as number) || 
                       (userData.id as number) || 
                       (userData.userId as number) || 
                       0;
        
        // Extraction des rôles 
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

        logger.debug('Rôles extraits', 'AuthService.processLoginResponse', { roles });
        
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

        logger.debug('Objet utilisateur créé', 'AuthService.processLoginResponse', {
          userId: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        });

        const result: LoginResponse = {
          message: (loginData.message as string) || 'Connexion réussie',
          user,
          jwtToken,
          refreshToken,
          expiresIn
        };
        
        logger.info('Réponse de connexion prête', 'AuthService.processLoginResponse', {
          hasUser: !!result.user,
          hasJwt: !!result.jwtToken,
          jwtLength: result.jwtToken.length,
          userRoles: result.user.roles
        });

        return result;
      }
    }
    
    // FORMAT INCONNU
    logger.error('Format de réponse non supporté', 'AuthService.processLoginResponse', {
      receivedData: data
    });
    throw new Error('Format de réponse non supporté');
  }

  // REGISTER - Inscription utilisateur
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      logger.info('Tentative d\'inscription', 'AuthService.register', {
        email: data.email
      });
     
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      logger.info('Inscription réussie', 'AuthService.register');
      
      return response.data;
      
    } catch (error: unknown) {
      logger.error('Échec de l\'inscription', 'AuthService.register', error);
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
      logger.info('Tentative de déconnexion', 'AuthService.logout');
      await apiClient.post('/auth/logout', {});
      logger.info('Déconnexion réussie', 'AuthService.logout');
      
    } catch (error: unknown) {
      logger.error('Échec de la déconnexion', 'AuthService.logout', error);
      throw error;
    }
  }

  // LOGIN ACTION - Pour compatibilité React Router
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

    logger.debug('Analyse détaillée de l\'erreur d\'authentification', 'AuthService.handleAuthError', {
      status,
      responseData: apiError.response?.data
    });

    // EXTRACTION DES ERREURS DE VALIDATION DÉTAILLÉES
    if (status === 400) {
      const responseData = apiError.response?.data;
      
      // Si le backend envoie les erreurs détaillées par champ
      if (responseData && typeof responseData === 'object' && 'errors' in responseData) {
        const validationErrors = responseData.errors as Record<string, string>;
        
        logger.debug('Erreurs de validation par champ détectées', 'AuthService.handleAuthError', {
          validationErrors
        });
        
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

    // ERREUR GÉNÉRIQUE
    return {
      success: false,
      errors: { 
        general: errorInfo.message || "Erreur de connexion. Veuillez réessayer."
      }
    };
  }

  // Traduit les erreurs de mot de passe spécifiques
  private translatePasswordError(passwordError: string): string {
    logger.debug('Traduction de l\'erreur de mot de passe', 'AuthService.translatePasswordError', {
      originalError: passwordError
    });
    
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

  // GESTION DES ERREURS D'INSCRIPTION
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
      logger.error('Erreur lors de la vérification de l\'expiration du token', 'AuthService.isTokenExpired', error);
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
      logger.error('Échec du décodage du JWT', 'AuthService.getUserFromToken', error);
      throw new Error('Invalid JWT token');
    }
  }

  // Parse les rôles depuis le JWT
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