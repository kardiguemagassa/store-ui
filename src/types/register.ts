// 🎯 INTERFACES - Définition des types pour les données du formulaire et les réponses
export interface RegisterFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPwd: string;
}

export interface ActionDataErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
}

export interface ActionData {
  success?: boolean;
  errors?: ActionDataErrors;
}

export interface RegisterActionResponse {
  success: boolean;
  errors?: ActionDataErrors;
}

// ✅ INTERFACE AMÉLIORÉE pour les erreurs API
export interface ApiError {
  response?: {
    status: number;
    data?: {
      errorMessage?: string;
      [key: string]: unknown;
    };
  };
  message?: string;
  status?: number;
}