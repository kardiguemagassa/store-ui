import { useLoaderData, useRevalidator } from "react-router-dom";
import { useState } from "react";
import contactService from "../services/contactService";
import type { ContactMessage } from "../types/contactService.types";
import { getErrorMessage } from "../../../shared/types/errors.types";

export function useContacts() {
  const loaderData = useLoaderData();
  const revalidator = useRevalidator();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typage sécurisé des messages
  const messages: ContactMessage[] = (() => {
    if (!loaderData || !Array.isArray(loaderData)) return [];
    return loaderData.filter((message): message is ContactMessage =>
      message && typeof message === 'object' && 'contactId' in message
    );
  })();

  const handleCloseMessage = async (contactId: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await contactService.closeMessage(contactId);
      revalidator.revalidate();
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      console.error("Close message error:", err);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    handleCloseMessage,
    revalidate: revalidator.revalidate
  };
}