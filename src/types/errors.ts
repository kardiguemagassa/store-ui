// types/errors.ts
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Fonction helper pour les erreurs
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return "An unexpected error occurred";
};