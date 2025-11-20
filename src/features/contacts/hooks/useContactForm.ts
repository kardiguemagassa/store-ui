import { useActionData, useNavigation, useSubmit } from "react-router-dom";
import { useRef, useEffect } from "react";
import { toast } from "react-toastify";
import type { ContactActionData } from "../types/contact.types";

export const useContactForm = () => {
  const actionData = useActionData() as ContactActionData | undefined;
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const submit = useSubmit();
  
  const isSubmitting = navigation.state === "submitting";
  
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  
  useEffect(() => {
    if (actionData?.success && !hasShownSuccess.current) {
      formRef.current?.reset();
      toast.success("Votre message a été envoyé avec succès!");
      hasShownSuccess.current = true;
      
      setTimeout(() => {
        hasShownSuccess.current = false;
      }, 1000);
    }
  }, [actionData?.success]);

  useEffect(() => {
    if (actionData?.error && !actionData.validationErrors && !hasShownError.current) {
      toast.error(actionData.error);
      hasShownError.current = true;
      
      setTimeout(() => {
        hasShownError.current = false;
      }, 1000);
    }
  }, [actionData?.error, actionData?.validationErrors]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir soumettre le formulaire?"
    );

    if (userConfirmed && formRef.current) {
      const formData = new FormData(formRef.current);
      submit(formData, { method: "post" });
    } else {
      toast.info("Soumission du formulaire annulée.");
    }
  };

  return {
    actionData,
    formRef,
    isSubmitting,
    handleSubmit
  };
};