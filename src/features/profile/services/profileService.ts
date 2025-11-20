import apiClient from '../../../shared/api/apiClient';
import { 
  handleApiError,
  extractValidationErrors,
  getErrorMessage,
  logger,
  type ActionDataErrors,
  type ApiError
} from '../../../shared/types/errors.types';
import type { 
  ProfileData, 
  ProfileResponse, 
  ProfileUpdateRequest 
} from '../types/profile.types';

// TYPES LOCAUX
interface ProfileActionResult {
  success: boolean;
  profileData?: ProfileData & { emailUpdated?: boolean };
  errors?: ActionDataErrors;
}

// HELPER : Normaliser ProfileResponse → ProfileData
function normalizeProfileData(response: ProfileResponse): ProfileData {
  logger.debug("Normalisation données profil", "ProfileService", {
    hasName: !!response.name,
    hasEmail: !!response.email,
    hasMobileNumber: !!response.mobileNumber,
    hasAddress: !!response.address
  });
  
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
  
  return normalized;
}


// HELPER : Obtenir le CSRF token

// Force la récupération du CSRF token en appelant /csrf-token
async function ensureCsrfToken(): Promise<void> {
  try {
    logger.debug("Récupération CSRF token", "ProfileService");
    
    await apiClient.get("/csrf-token");
    
    logger.debug("CSRF token récupéré avec succès", "ProfileService");
    
  } catch (error) {
    logger.warn("Échec récupération CSRF token", "ProfileService", error);
    // On continue quand même, le backend devrait gérer
  }
}

// LOADER (pour React Router)
export async function profileLoader(): Promise<ProfileData> {
  try {
    logger.info("Chargement données profil", "ProfileService");
    
    const response = await apiClient.get<ProfileResponse>("/profile");
    
    if (!response.data) {
      throw new Error("Aucune donnée de profil reçue");
    }
    
    const profileData = normalizeProfileData(response.data);
    
    logger.info("Profil chargé avec succès", "ProfileService", {
      hasName: !!profileData.name,
      hasEmail: !!profileData.email
    });
    
    return profileData;
    
  } catch (error: unknown) {
    logger.error("Erreur chargement profil", "ProfileService", error);
    
    const apiError = error as ApiError;
    
    throw new Response(getErrorMessage(error), { 
      status: apiError.response?.status || apiError.status || 500 
    });
  }
}

// ACTION (pour React Router)
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

  logger.info("Mise à jour profil demandée", "ProfileService", {
    hasName: !!profileRequest.name,
    hasEmail: !!profileRequest.email,
    hasMobileNumber: !!profileRequest.mobileNumber,
    hasAddress: !!(profileRequest.street || profileRequest.city)
  });

  try {
    // FIX CRITIQUE: Obtenir le CSRF token AVANT le PUT
    await ensureCsrfToken();
    
    // Petit délai pour s'assurer que le cookie est bien défini
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await apiClient.put<ProfileResponse>("/profile", profileRequest);

    const backendResponse = response.data;
    const normalizedData = normalizeProfileData(backendResponse);
    
    const resultData: ProfileData & { emailUpdated?: boolean } = {
      ...normalizedData,
      emailUpdated: backendResponse.emailUpdated || false
    };
    
    logger.info("Profil mis à jour avec succès", "ProfileService", {
      emailUpdated: resultData.emailUpdated
    });
    
    return { 
      success: true, 
      profileData: resultData 
    };
    
  } catch (error: unknown) {
    logger.error("Erreur mise à jour profil", "ProfileService", error);
    
    const errorInfo = handleApiError(error);
    const validationErrors = extractValidationErrors(error);

    if (validationErrors) {
      logger.warn("Erreurs validation profil", "ProfileService", {
        errorFields: Object.keys(validationErrors)
      });
      
      return { 
        success: false, 
        errors: validationErrors 
      };
    }

    return {
      success: false,
      errors: { general: errorInfo.message } as ActionDataErrors
    };
  }
}

// API CALLS (fonctions réutilisables)
export async function getProfile(): Promise<ProfileData> {
  try {
    const response = await apiClient.get<ProfileResponse>("/profile");
    const profileData = normalizeProfileData(response.data);
    
    logger.debug("Profil récupéré via API", "ProfileService", {
      hasName: !!profileData.name,
      hasEmail: !!profileData.email
    });
    
    return profileData;
    
  } catch (error: unknown) {
    logger.error("Erreur récupération profil API", "ProfileService", error);
    throw error;
  }
}

export async function updateProfile(
  profileData: ProfileUpdateRequest
): Promise<ProfileData> {
  try {
    logger.info("Mise à jour profil via API", "ProfileService", {
      hasName: !!profileData.name,
      hasEmail: !!profileData.email,
      hasMobileNumber: !!profileData.mobileNumber
    });
    
    // S'assurer que le CSRF token est disponible
    await ensureCsrfToken();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await apiClient.put<ProfileResponse>(
      "/profile", 
      profileData
    );
    
    const normalizedData = normalizeProfileData(response.data);
    
    logger.info("Profil mis à jour via API avec succès", "ProfileService", {
      emailUpdated: response.data.emailUpdated || false
    });
    
    return normalizedData;
    
  } catch (error: unknown) {
    logger.error("Erreur mise à jour profil API", "ProfileService", error);
    throw error;
  }
}

export function hasEmailChanged(
  oldEmail: string, 
  newEmail: string
): boolean {
  const changed = oldEmail.toLowerCase().trim() !== newEmail.toLowerCase().trim();
  
  logger.debug("Vérification changement email", "ProfileService", {
    emailChanged: changed,
    oldEmailLength: oldEmail.length,
    newEmailLength: newEmail.length
  });
  
  return changed;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email);
  
  if (!valid) {
    logger.debug("Validation email échouée", "ProfileService", {
      emailLength: email.length
    });
  }
  
  return valid;
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  const valid = phoneRegex.test(phone);
  
  if (!valid) {
    logger.debug("Validation téléphone échouée", "ProfileService", {
      phoneLength: phone.length
    });
  }
  
  return valid;
}

export function isValidPostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^\d{5}$/;
  const valid = postalCodeRegex.test(postalCode);
  
  if (!valid) {
    logger.debug("Validation code postal échouée", "ProfileService", {
      postalCodeLength: postalCode.length
    });
  }
  
  return valid;
}

// EXPORT PAR DÉFAUT
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