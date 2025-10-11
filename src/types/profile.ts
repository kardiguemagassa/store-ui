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
  address: Address;
}

export interface ProfileResponse {
  userId?: number;
  name: string;
  email: string;
  mobileNumber: string;
  roles?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}




// à supprimer toutes les erreurs
/*
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
}*/