import apiClient from '../../../shared/api/apiClient';
import { 
  handleApiError,
  extractValidationErrors,
  getErrorMessage,
  type ActionDataErrors,
  type ApiError
} from '../../../shared/types/errors.types';
import type { 
  ProfileData, 
  ProfileResponse, 
  ProfileUpdateRequest 
} from '../types/profile.types';

// ============================================
// TYPES LOCAUX
// ============================================

interface ProfileActionResult {
  success: boolean;
  profileData?: ProfileData & { emailUpdated?: boolean };
  errors?: ActionDataErrors;
}

// ============================================
// HELPER : Normaliser ProfileResponse → ProfileData
// ============================================

function normalizeProfileData(response: ProfileResponse): ProfileData {
  console.log("🔄 Normalizing profile data:", response);
  
  const normalized: ProfileData = {
    name: response.name || "",
    email: response.email || "",
    mobileNumber: response.mobileNumber || "",
    address: response.address || {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    }
  };
  
  console.log("✅ Normalized profile data:", normalized);
  
  return normalized;
}

// ============================================
// ✅ HELPER : Obtenir le CSRF token
// ============================================

/**
 * Force la récupération du CSRF token en appelant /csrf-token
 * Ceci garantit que le cookie XSRF-TOKEN est défini
 */
async function ensureCsrfToken(): Promise<void> {
  try {
    console.log("🔄 Fetching CSRF token from backend...");
    
    // ✅ Appeler l'endpoint CSRF
    await apiClient.get("/csrf-token");
    
    console.log("✅ CSRF token endpoint called successfully");
    console.log("📋 Cookies after CSRF fetch:", document.cookie);
    
  } catch (error) {
    console.error("❌ Failed to fetch CSRF token:", error);
    // On continue quand même, le backend devrait gérer
  }
}

// ============================================
// LOADER (pour React Router)
// ============================================

export async function profileLoader(): Promise<ProfileData> {
  try {
    console.log('🔄 Loading profile data...');
    
    const response = await apiClient.get<ProfileResponse>("/profile");
    
    console.log('📥 Backend response:', response.data);
    
    if (!response.data) {
      throw new Error("Aucune donnée de profil reçue");
    }
    
    const profileData = normalizeProfileData(response.data);
    
    console.log('✅ Profile loaded successfully');
    
    return profileData;
    
  } catch (error: unknown) {
    console.error('❌ Error loading profile:', error);
    
    const apiError = error as ApiError;
    
    throw new Response(getErrorMessage(error), { 
      status: apiError.response?.status || apiError.status || 500 
    });
  }
}

// ============================================
// ACTION (pour React Router)
// ============================================

export async function profileAction({ 
  request 
}: { 
  request: Request 
}): Promise<ProfileActionResult> {
  const formData = await request.formData();

  const profileRequest: ProfileUpdateRequest = {
    name: (formData.get("name") as string)?.trim() || "",
    email: (formData.get("email") as string)?.trim() || "",
    mobileNumber: (formData.get("mobileNumber") as string)?.trim() || "",
    street: (formData.get("street") as string)?.trim() || "",    
    city: (formData.get("city") as string)?.trim() || "",          
    state: (formData.get("state") as string)?.trim() || "",         
    postalCode: (formData.get("postalCode") as string)?.trim() || "", 
    country: (formData.get("country") as string)?.trim() || "",     
  };

  console.log('🔄 Updating profile with request:', profileRequest);

  try {
    // ✅ FIX CRITIQUE: Obtenir le CSRF token AVANT le PUT
    await ensureCsrfToken();
    
    // ✅ Petit délai pour s'assurer que le cookie est bien défini
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log("📋 Cookies before PUT:", document.cookie);
    
    // ✅ Maintenant faire le PUT
    const response = await apiClient.put<ProfileResponse>("/profile", profileRequest);

    console.log('📥 Backend update response:', response.data);

    const backendResponse = response.data;
    const normalizedData = normalizeProfileData(backendResponse);
    
    const resultData: ProfileData & { emailUpdated?: boolean } = {
      ...normalizedData,
      emailUpdated: backendResponse.emailUpdated || false
    };
    
    console.log('✅ Profile updated successfully:', resultData);
    
    return { 
      success: true, 
      profileData: resultData 
    };
    
  } catch (error: unknown) {
    console.error('❌ Error updating profile:', error);
    
    const errorInfo = handleApiError(error);
    const validationErrors = extractValidationErrors(error);

    if (validationErrors) {
      console.log('❌ Validation errors:', validationErrors);
      return { 
        success: false, 
        errors: validationErrors 
      };
    }

    console.log('❌ General error:', errorInfo.message);
    return {
      success: false,
      errors: { general: errorInfo.message } as ActionDataErrors
    };
  }
}

// ============================================
// API CALLS (fonctions réutilisables)
// ============================================

export async function getProfile(): Promise<ProfileData> {
  try {
    const response = await apiClient.get<ProfileResponse>("/profile");
    return normalizeProfileData(response.data);
    
  } catch (error: unknown) {
    console.error('❌ Error fetching profile:', getErrorMessage(error));
    throw error;
  }
}

export async function updateProfile(
  profileData: ProfileUpdateRequest
): Promise<ProfileData> {
  try {
    console.log('🔄 updateProfile API call with:', profileData);
    
    // ✅ S'assurer que le CSRF token est disponible
    await ensureCsrfToken();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await apiClient.put<ProfileResponse>(
      "/profile", 
      profileData
    );
    
    console.log('📥 updateProfile response:', response.data);
    
    return normalizeProfileData(response.data);
    
  } catch (error: unknown) {
    console.error('❌ Error updating profile:', getErrorMessage(error));
    throw error;
  }
}

export function hasEmailChanged(
  oldEmail: string, 
  newEmail: string
): boolean {
  return oldEmail.toLowerCase().trim() !== newEmail.toLowerCase().trim();
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

export function isValidPostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^\d{5}$/;
  return postalCodeRegex.test(postalCode);
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

const profileService = {
  profileLoader,
  profileAction,
  getProfile,
  updateProfile,
  hasEmailChanged,
  isValidEmail,
  isValidPhone,
  isValidPostalCode
};

export default profileService;

/**
 * ✅ CHANGEMENTS v3.1 - CSRF WORKAROUND:
 * 
 * 1. ✅ ensureCsrfToken():
 *    - Appelle GET /csrf-token pour forcer la création du cookie
 *    - Attend 100ms pour laisser le temps au navigateur de définir le cookie
 * 
 * 2. ✅ profileAction():
 *    - Appelle ensureCsrfToken() AVANT le PUT
 *    - Log les cookies avant le PUT pour vérifier
 * 
 * 3. ✅ updateProfile():
 *    - Même workaround pour l'API directe
 * 
 * FLUX CORRIGÉ:
 * 
 * User clique "Sauvegarder"
 *   → profileAction()
 *     → ensureCsrfToken()
 *       → GET /csrf-token
 *         → Backend crée cookie XSRF-TOKEN
 *           → Navigateur stocke le cookie ✅
 *             → Délai 100ms
 *               → PUT /profile avec X-XSRF-TOKEN header ✅
 *                 → Backend valide CSRF ✅
 *                   → Mise à jour réussie ! ✅
 * 
 * TESTS À FAIRE:
 * 
 * 1. Allez sur /profile
 * 2. Modifiez un champ
 * 3. Cliquez "Sauvegarder"
 * 4. Console doit montrer:
 *    🔄 Fetching CSRF token from backend...
 *    ✅ CSRF token endpoint called successfully
 *    📋 Cookies before PUT: ...XSRF-TOKEN=...
 *    ✅ [REQUEST] CSRF token added
 *    ✅ [RESPONSE] 200 /profile
 *    ✅ Profile updated successfully
 */