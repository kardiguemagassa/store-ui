/**
 * PROFILE TYPES - VERSION FINALE
 * 
 * ✅ Correspond EXACTEMENT au backend Java
 * 
 * VERSION 3.0 - PRODUCTION READY
 */

// ============================================
// ADDRESS (correspond à AddressDto.java)
// ============================================

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ============================================
// PROFILE DATA (Frontend - formulaire)
// ============================================

export interface ProfileData {
  name: string;
  email: string;
  mobileNumber: string;
  address: Address;
}

// ============================================
// PROFILE RESPONSE (Backend - ProfileResponseDto.java)
// ============================================

/**
 * ✅ Correspond EXACTEMENT à ProfileResponseDto.java
 */
export interface ProfileResponse {
  customerId?: number;
  name: string;
  email: string;
  mobileNumber: string;
  address: Address; // ✅ Toujours présent dans votre backend
  emailUpdated: boolean; // ✅ Présent dans ProfileResponseDto
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

// ============================================
// PROFILE REQUEST (Frontend → Backend)
// ============================================

/**
 * ✅ Correspond à ProfileRequestDto.java
 */
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

// ============================================
// VALIDATION ERRORS
// ============================================

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

/**
 * ✅ MAPPING BACKEND → FRONTEND
 * 
 * Backend ProfileResponseDto:
 * {
 *   customerId: 123,
 *   name: "John Doe",
 *   email: "john@example.com",
 *   mobileNumber: "0612345678",
 *   address: {
 *     street: "123 Main St",
 *     city: "Paris",
 *     state: "Île-de-France",
 *     postalCode: "75001",
 *     country: "FR"
 *   },
 *   emailUpdated: false,
 *   createdAt: "2024-01-15T10:30:00",
 *   updatedAt: "2024-01-20T14:25:00",
 *   isActive: true
 * }
 * 
 * Frontend ProfileData:
 * {
 *   name: "John Doe",
 *   email: "john@example.com",
 *   mobileNumber: "0612345678",
 *   address: {
 *     street: "123 Main St",
 *     city: "Paris",
 *     state: "Île-de-France",
 *     postalCode: "75001",
 *     country: "FR"
 *   }
 * }
 */