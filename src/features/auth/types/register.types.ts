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