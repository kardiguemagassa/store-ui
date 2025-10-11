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