import React from 'react';
import { Form } from 'react-router-dom';
import type { ContactActionData } from '../../types/contactService.types';

interface ContactFormProps {
  actionData?: ContactActionData;
  isSubmitting?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  actionData,
  isSubmitting = false,
  onSubmit,
  formRef
}) => {
  const labelStyle = "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle = "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";

  return (
    <Form
      method="POST"
      ref={formRef}
      onSubmit={onSubmit}
      className="space-y-6 max-w-[768px] mx-auto"
    >
      <div>
        <label htmlFor="name" className={labelStyle}>
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Votre nom"
          className={textFieldStyle}
          required
          minLength={2}
          maxLength={50}
        />
        {actionData?.validationErrors?.name && (
          <p className="text-red-500 text-sm mt-1">
            {actionData.validationErrors.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className={labelStyle}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Votre email"
            className={textFieldStyle}
            required
          />
          {actionData?.validationErrors?.email && (
            <p className="text-red-500 text-sm mt-1">
              {actionData.validationErrors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="mobileNumber" className={labelStyle}>
            Numéro de portable
          </label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            required
            pattern="^\d{10}$"
            title="Le numéro de téléphone portable doit comporter exactement 10 chiffres"
            placeholder="Votre portable"
            className={textFieldStyle}
          />
          {actionData?.validationErrors?.mobileNumber && (
            <p className="text-red-500 text-sm mt-1">
              {actionData.validationErrors.mobileNumber}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelStyle}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Votre message"
          className={textFieldStyle}
          required
          minLength={10}
          maxLength={500}
        />
        {actionData?.validationErrors?.message && (
          <p className="text-red-500 text-sm mt-1">
            {actionData.validationErrors.message}
          </p>
        )}
      </div>

      {actionData?.error && !actionData.validationErrors && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {actionData.error}
        </div>
      )}

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
  );
};

export default ContactForm;