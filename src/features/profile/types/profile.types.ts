// ADDRESS (correspond à AddressDto.java)
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// PROFILE DATA (Frontend - formulaire)
export interface ProfileData {
  name: string;
  email: string;
  mobileNumber: string;
  address: Address;
}

// PROFILE RESPONSE (Backend - ProfileResponseDto.java)
export interface ProfileResponse {
  customerId?: number;
  name: string;
  email: string;
  mobileNumber: string;
  address: Address; 
  emailUpdated: boolean; 
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

// PROFILE REQUEST (Frontend → Backend)
export interface ProfileUpdateRequest {
  name: string;
  email: string;
  mobileNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ProfileValidationErrors {
  name?: string;
  email?: string;
  mobileNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  general?: string;
}