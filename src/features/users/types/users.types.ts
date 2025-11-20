export interface CustomerWithRoles {
  customerId: number;
  name: string;
  email: string;
  roles: string[];
  createdAt?: string;
  isActive?: boolean;
}

export interface PaginatedUsersResponse {
  content: CustomerWithRoles[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type RoleType = 
  | "ROLE_USER"
  | "ROLE_EMPLOYEE"
  | "ROLE_MANAGER"
  | "ROLE_ADMIN";

export const ROLES = {
  USER: "ROLE_USER",
  EMPLOYEE: "ROLE_EMPLOYEE",
  MANAGER: "ROLE_MANAGER",
  ADMIN: "ROLE_ADMIN"
} as const;

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  ROLE_USER: "Client",
  ROLE_EMPLOYEE: "Employé",
  ROLE_MANAGER: "Gestionnaire",
  ROLE_ADMIN: "Administrateur"
};

export const ROLE_COLORS: Record<string, string> = {
  ROLE_USER: "bg-blue-500",
  ROLE_EMPLOYEE: "bg-green-500",
  ROLE_MANAGER: "bg-yellow-500",
  ROLE_ADMIN: "bg-red-500"
};

export interface UserFilters {
  page?: number;
  size?: number;
}