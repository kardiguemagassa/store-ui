import apiClient from '../../../shared/api/apiClient';
import { getErrorMessage, type ApiError} from '../../../shared/types/errors.types';
import type {PaginatedUsersResponse, RoleType,UserFilters} from '../types/users.types';

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
  } catch {
    // Silently continue
  }
}

// FONCTION AVEC RETRY INTELLIGENT

async function executeWithCsrfRetry<T>(
  operation: () => Promise<T>,
  _operationName: string,
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
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return execute();
      }
      
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
    
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    
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
    },
    `Remove role ${roleType} from user ${userId}`,
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
      return response.data.message || 'Rôle assigné avec succès';
    },
    `Assign role ${roleType} to user ${userId}`,
    2
  );
}

export async function promoteUser(userId: number): Promise<string> {
  return executeWithCsrfRetry(
    async () => {
      const response = await apiClient.post<{ message: string }>(
        `/admin/users/${userId}/promote`
      );
      return response.data.message;
    },
    `Promote user ${userId}`,
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

  const response = await apiClient.get<PaginatedUsersResponse>(
    '/admin/users',
    { params }
  );

  return response.data;
}

export function getAvailableRoles(currentRoles: string[]): RoleType[] {
  const allRoles: RoleType[] = [
    'ROLE_EMPLOYEE', 
    'ROLE_MANAGER', 
    'ROLE_ADMIN'
  ];
  return allRoles.filter(role => !currentRoles.includes(role));
}

// FONCTIONS DE DEBUG (conservées mais sans logs par défaut)

export function debugCsrfStatus(): void {
  // Fonction conservée pour le debug si nécessaire
}

export async function testCsrfEndpoint(): Promise<void> {
  // Fonction conservée pour le debug si nécessaire
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