import React from "react";
import PageTitle from "./PageTitle";
import { Form } from "react-router-dom";
import {
  useActionData,
  useNavigation,
  useSubmit,
  useLoaderData,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import type { ContactInfo, ContactActionData } from "../types/contact";

export default function Contact() {
  const contactInfo = useLoaderData() as ContactInfo;
  const actionData = useActionData() as ContactActionData | undefined;
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";
  
  // RE-F POUR BLOQUER LES DOUBLONS
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  
  useEffect(() => {
    if (actionData?.success && !hasShownSuccess.current) {
      formRef.current?.reset();
      toast.success("Votre message a été envoyé avec succès!");
      hasShownSuccess.current = true;
      
      // Reset après un délai pour permettre une nouvelle soumission
      setTimeout(() => {
        hasShownSuccess.current = false;
      }, 1000);
    }
  }, [actionData?.success]);

  useEffect(() => {
    if (actionData?.error && !actionData.validationErrors && !hasShownError.current) {
      toast.error(actionData.error);
      hasShownError.current = true;
      
      // Reset après un délai
      setTimeout(() => {
        hasShownError.current = false;
      }, 1000);
    }
  }, [actionData?.error, actionData?.validationErrors]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userConfirmed = window.confirm(
      "Etes-vous sûr de vouloir soumettre le formulaire?"
    );

    if (userConfirmed) {
      const formData = new FormData(formRef.current!);
      submit(formData, { method: "post" });
    } else {
      toast.info("Soumission du formulaire annulée.");
    }
  };

  const labelStyle =
    "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle =
    "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";
  
  return (
    <div className="max-w-[1152px] min-h-[852px] mx-auto px-6 py-8 font-primary bg-normalbg dark:bg-darkbg">
      {/* Page Title */}
      <PageTitle title="Contactez-nous" />
      {/* Contact Info */}
      <p className="max-w-[768px] mx-auto mt-8 text-gray-600 dark:text-lighter mb-8 text-center">
        N'hésitez pas à nous contacter pour toute question, commentaire ou suggestion.
      </p>

      {/* Contact Info + Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-[952px] mx-auto mt-8">
        {/* Left: Contact Details */}
        <div className="text-primary dark:text-light p-6">
          <h2 className="text-2xl font-semibold mb-4">Coordonnées</h2>
          {contactInfo && (
            <>
              <p className="mb-4">
                <strong>Téléphone:</strong> {contactInfo.phone}
              </p>
              <p className="mb-4">
                <strong>Email:</strong> {contactInfo.email}
              </p>
              <p className="mb-4">
                <strong>Adresse:</strong> {contactInfo.address}
              </p>
            </>
          )}
        </div>
        
        {/* Contact Form */}
        <Form
          method="POST"
          ref={formRef}
          onSubmit={handleSubmit}
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
              minLength={5}
              maxLength={30}
            />
            {actionData?.validationErrors?.name && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.validationErrors.name}
              </p>
            )}
          </div>

          {/* Email and mobile Row */}
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
              minLength={5}
              maxLength={500}
            ></textarea>
            {actionData?.validationErrors?.message && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.validationErrors.message}
              </p>
            )}
          </div>

          {/* Global Error Message */}
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
              {isSubmitting ? "Submitting..." : "Envoyer"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}