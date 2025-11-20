import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage, logger, type ApiError } from '../../../shared/types/errors.types';
import type { PaginatedUsersResponse, RoleType, UserFilters } from '../types/users.types';

// INTERFACE POUR LA RÉPONSE CSRF
interface CsrfTokenResponse {
  token: string;
  headerName: string;
  parameterName: string;
}

// TYPE GUARD POUR AxiosError
function isAxiosError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && ('response' in error || 'message' in error);
}

// FONCTION POUR FORCER LE RAFRAÎCHISSEMENT CSRF
async function ensureCsrfToken(): Promise<void> {
  try {
    const cookies = document.cookie;
    const hasValidCsrf = cookies.includes('XSRF-TOKEN=') && !cookies.includes('XSRF-TOKEN=;') && !cookies.includes('XSRF-TOKEN=deleted');
    
    if (!hasValidCsrf) {
      logger.info("Rafraîchissement CSRF token", "UserService");
      
      try {
        await apiClient.get<CsrfTokenResponse>('/csrf-token', {
          headers: {
            Authorization: undefined,
            'X-XSRF-TOKEN': undefined
          }
        });
      } catch {
        await apiClient.get('/admin/users', {
          params: { page: 0, size: 1 },
          headers: {
            Authorization: undefined,
            'X-XSRF-TOKEN': undefined
          }
        });
      }
    }
  } catch (error) {
    logger.debug("Échec rafraîchissement CSRF", "UserService", {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// FONCTION AVEC RETRY INTELLIGENT
async function executeWithCsrfRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 2
): Promise<T> {
  let retryCount = 0;
  
  const execute = async (): Promise<T> => {
    try {
      if (retryCount > 0) {
        await ensureCsrfToken();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      return await operation();
      
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      
      let isCsrfError = false;
      
      if (isAxiosError(error)) {
        isCsrfError = errorMessage.includes('CSRF') || 
                     errorMessage.includes('403') || 
                     errorMessage.includes('Accès refusé') ||
                     error.response?.status === 403;
      }
      
      if (isCsrfError && retryCount < maxRetries) {
        retryCount++;
        const delay = retryCount * 500;
        
        logger.warn("Tentative retry après erreur CSRF", "UserService", {
          operationName,
          retryCount,
          delay,
          error: errorMessage
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return execute();
      }
      
      const errorMetadata = error instanceof Error ? { 
        errorName: error.name,
        errorMessage: error.message 
      } : { 
        errorType: typeof error 
      };
      
      logger.error("Échec opération après retry", "UserService", {
        operationName,
        retryCount,
        isCsrfError,
        ...errorMetadata
      });
      
      throw error;
    }
  };
  
  return execute();
}

// LOADER
export async function usersLoader({ 
  request 
}: { 
  request: Request 
}): Promise<PaginatedUsersResponse> {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "0";
  const size = url.searchParams.get("size") || "10";

  try {
    const response = await apiClient.get<PaginatedUsersResponse>("/admin/users", {
      params: { page, size }
    });
    
    logger.debug("Chargement utilisateurs réussi", "UserService", {
      page,
      size,
      usersCount: response.data.content?.length || 0
    });
    
    return response.data;
  } catch (error: unknown) {
    const errorMetadata = error instanceof Error ? { 
      errorName: error.name,
      errorMessage: error.message.substring(0, 100) 
    } : { 
      errorType: typeof error 
    };
    
    logger.error("Erreur chargement utilisateurs", "UserService", {
      page,
      size,
      ...errorMetadata
    });
    
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: parseInt(size),
      number: parseInt(page),
      first: true,
      last: true
    };
  }
}

// API CALLS AVEC GESTION CSRF ROBUSTE
export async function removeRole(
  userId: number,
  roleType: RoleType
): Promise<void> {
  return executeWithCsrfRetry(
    async () => {
      await apiClient.delete(`/admin/users/${userId}/roles/${roleType}`);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      logger.info("Rôle supprimé avec succès", "UserService", {
        userId,
        roleType
      });
    },
    `removeRole-${userId}-${roleType}`,
    2
  );
}

export async function assignRole(
  userId: number,
  roleType: RoleType
): Promise<string> {
  return executeWithCsrfRetry(
    async () => {
      const response = await apiClient.post<{ message: string }>(
        `/admin/users/${userId}/roles/${roleType}`
      );
      
      const message = response.data.message || 'Rôle assigné avec succès';
      
      logger.info("Rôle assigné avec succès", "UserService", {
        userId,
        roleType,
        serverMessage: message
      });
      
      return message;
    },
    `assignRole-${userId}-${roleType}`,
    2
  );
}

export async function promoteUser(userId: number): Promise<string> {
  return executeWithCsrfRetry(
    async () => {
      const response = await apiClient.post<{ message: string }>(
        `/admin/users/${userId}/promote`
      );
      
      logger.info("Utilisateur promu avec succès", "UserService", {
        userId,
        serverMessage: response.data.message
      });
      
      return response.data.message;
    },
    `promoteUser-${userId}`,
    2
  );
}

// AUTRES FONCTIONS
export async function getAllUsers(
  filters?: UserFilters
): Promise<PaginatedUsersResponse> {
  const params = {
    page: filters?.page || 0,
    size: filters?.size || 20
  };

  try {
    const response = await apiClient.get<PaginatedUsersResponse>(
      '/admin/users',
      { params }
    );

    logger.debug("Récupération tous utilisateurs", "UserService", {
      page: params.page,
      size: params.size,
      usersCount: response.data.content?.length || 0
    });

    return response.data;
  } catch (error: unknown) {
    // ✅ CORRECTION : 3 arguments maximum
    const errorMetadata = error instanceof Error ? { 
      errorName: error.name,
      errorMessage: error.message.substring(0, 100) 
    } : { 
      errorType: typeof error 
    };
    
    logger.error("Erreur récupération tous utilisateurs", "UserService", {
      page: params.page,
      size: params.size,
      ...errorMetadata
    });
    throw error;
  }
}

export function getAvailableRoles(currentRoles: string[]): RoleType[] {
  const allRoles: RoleType[] = [
    'ROLE_EMPLOYEE', 
    'ROLE_MANAGER', 
    'ROLE_ADMIN'
  ];
  
  const availableRoles = allRoles.filter(role => !currentRoles.includes(role));
  
  logger.debug("Rôles disponibles calculés", "UserService", {
    currentRolesCount: currentRoles.length,
    availableRolesCount: availableRoles.length
  });
  
  return availableRoles;
}

// FONCTIONS DE DEBUG
export function debugCsrfStatus(): void {
  const cookies = document.cookie;
  const hasCsrf = cookies.includes('XSRF-TOKEN=');
  
  logger.debug("Statut CSRF", "UserService", {
    hasCsrfToken: hasCsrf,
    cookiesCount: cookies.split(';').length
  });
}

export async function testCsrfEndpoint(): Promise<void> {
  try {
    await apiClient.get('/csrf-token');
    logger.info("Test CSRF endpoint réussi", "UserService");
  } catch (error: unknown) {
    const errorMetadata = error instanceof Error ? { 
      errorName: error.name,
      errorMessage: error.message 
    } : { 
      errorType: typeof error 
    };
    
    logger.error("Test CSRF endpoint échoué", "UserService", {
      ...errorMetadata
    });
    throw error;
  }
}

const userService = {
  usersLoader,
  getAllUsers,
  promoteUser,
  assignRole,
  removeRole,
  getAvailableRoles,
  debugCsrfStatus,
  testCsrfEndpoint
};

export default userService;