// components/Contact.tsx
import React, { useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigation, useSubmit } from "react-router-dom";
import { toast } from "react-toastify";
import PageTitle from "./PageTitle";
import type { ContactActionData, ContactValidationErrors } from "../types/contact";

export default function Contact() {
  const actionData = useActionData() as ContactActionData | undefined;
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const submit = useSubmit();

  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const isSubmitting = navigation.state === "submitting";

  /**
   * Effect : gère le résultat de la soumission
   */
  useEffect(() => {
    if (actionData?.success) {
      formRef.current?.reset();
      setErrors({});
      toast.success("Votre message a été envoyé avec succès !");
    } else if (actionData?.error) {
      toast.error(actionData.error);

      if (actionData.validationErrors) {
        setErrors(actionData.validationErrors);
      }
    }
  }, [actionData]);

  /**
   * Efface l'erreur quand l'utilisateur corrige
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name } = e.target;
    if (errors[name as keyof ContactValidationErrors]) {
      const newErrors = { ...errors };
      delete newErrors[name as keyof ContactValidationErrors];
      setErrors(newErrors);
    }
  };

  /**
   * Gère la soumission avec confirmation
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir envoyer ce message ?"
    );

    if (confirmed) {
      const formData = new FormData(formRef.current!);
      submit(formData, { method: "post" });
    } else {
      toast.info("Envoi annulé");
    }
  };

  // Styles
  const labelStyle = "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle = "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";
  const errorFieldStyle = "w-full px-4 py-2 text-base border-2 border-red-500 rounded-md transition focus:ring focus:ring-red-300 focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";
  const errorTextStyle = "text-red-500 dark:text-red-400 text-sm mt-1";

  return (
    <div className="max-w-[1152px] min-h-[852px] mx-auto px-6 py-8 font-primary bg-normalbg dark:bg-darkbg">
      <PageTitle title="Contactez-nous" />

      <p className="max-w-[768px] mx-auto mt-8 text-gray-600 dark:text-lighter mb-8 text-center">
        N'hésitez pas à nous contacter pour toute question, commentaire ou suggestion.
      </p>

      <Form
        method="POST"
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6 max-w-[768px] mx-auto"
      >
        {/* Nom */}
        <div>
          <label htmlFor="name" className={labelStyle}>
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            //required
            //minLength={5}
            //maxLength={30}
            placeholder="Votre nom"
            className={errors.name ? errorFieldStyle : textFieldStyle}
            onChange={handleChange}
          />
          {errors.name && <p className={errorTextStyle}>{errors.name}</p>}
        </div>

        {/* Email + Téléphone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className={labelStyle}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              className={errors.email ? errorFieldStyle : textFieldStyle}
              onChange={handleChange}
            />
            {errors.email && <p className={errorTextStyle}>{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="mobileNumber" className={labelStyle}>
              Téléphone <span className="text-red-500">*</span>
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              required
              placeholder="0623456789"
              className={errors.mobileNumber ? errorFieldStyle : textFieldStyle}
              onChange={handleChange}
            />
            {errors.mobileNumber && (
              <p className={errorTextStyle}>{errors.mobileNumber}</p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className={labelStyle}>
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Votre message..."
            //required
            //minLength={5}
            //maxLength={500}
            className={errors.message ? errorFieldStyle : textFieldStyle}
            onChange={handleChange}
          />
          {errors.message && <p className={errorTextStyle}>{errors.message}</p>}
        </div>

        {/* Bouton */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer"}
          </button>
        </div>
      </Form>
    </div>
  );
}