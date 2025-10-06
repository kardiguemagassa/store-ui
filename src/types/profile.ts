export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ProfileData {
  name: string;
  email: string;
  mobileNumber: string;
  address: Address; // ✅ Maintenant address est un objet
}

export interface ActionDataErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ActionData {
  success?: boolean;
  profileData?: ProfileData & { emailUpdated?: boolean };
  errors?: ActionDataErrors;
}

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