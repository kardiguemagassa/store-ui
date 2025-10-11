
import React, { useRef, useEffect } from "react";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useNavigate,
  useSubmit,
} from "react-router-dom";

import { toast } from "react-toastify";
import PageTitle from "./PageTitle";
import type { ActionData } from "../types/register";


export default function Register() {

  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  // ÉTAT DE SOUMISSION - Indicateur de chargement pendant la soumission
  const isSubmitting = navigation.state === "submitting";

  // EFFET - Redirection après inscription réussie
  useEffect(() => {
    if (actionData?.success) {
      navigate("/login");
      toast.success("Inscription réussie. Vous pouvez vous connecter.");
    }
  }, [actionData, navigate]);

  // SOUMISSION DU FORMULAIRE - Validation personnalisée avant envoi
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(formRef.current!);
    if (!validatePasswords(formData)) {
      return;
    }
    submit(formData, { method: "post" });
  };

  /**
   * Validate Passwords Match
   */
  const validatePasswords = (formData: FormData): boolean => {
    const password = formData.get("password") as string;
    const confirmPwd = formData.get("confirmPwd") as string;

    if (password !== confirmPwd) {
      toast.error("Les mots de passe ne correspondent pas!");
      return false;
    }
    return true;
  };

  const labelStyle =
    "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle =
    "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";

  return (
    <div className="min-h-[752px] flex items-center justify-center font-primary dark:bg-darkbg">
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6">
        <PageTitle title="Inscription" />

        <Form
          method="POST"
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/*Validation côté client et serveur */}
          <div>
            <label htmlFor="name" className={labelStyle}>
              Nom
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Votre Nom"
              required
              minLength={2}
              maxLength={30}
              className={textFieldStyle}
            />
            {actionData?.errors?.name && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.name}
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
                type="email"
                name="email"
                placeholder="Votre Email"
                autoComplete="email"
                required
                className={textFieldStyle}
              />
              {actionData?.errors?.email && (
                <p className="text-red-500 text-sm mt-1">
                  {actionData.errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="mobileNumber" className={labelStyle}>
                Numéro portable
              </label>
              <input
                id="mobileNumber"
                type="tel"
                name="mobileNumber"
                placeholder="Votre portable"
                required
                pattern="^\d{10}$"
                title="Le numéro de téléphone portable doit comporter exactement 10 chiffres"
                className={textFieldStyle}
              />
              {actionData?.errors?.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {actionData.errors.mobileNumber}
                </p>
              )}
            </div>
          </div>

          {/* MOT DE PASSE - Avec confirmation et validation */}
          <div>
            <label htmlFor="password" className={labelStyle}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Votre mot de passe"
              required
              autoComplete="new-password"
              minLength={8}
              maxLength={20}
              className={textFieldStyle}
            />
            {actionData?.errors?.password && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPwd" className={labelStyle}>
              Confirmez le mot de passe
            </label>
            <input
              id="confirmPwd"
              type="password"
              name="confirmPwd"
              placeholder="Confirmez votre mot de passe"
              required
              autoComplete="confirm-password"
              minLength={8}
              maxLength={20}
              className={textFieldStyle}
            />
          </div>

          {/* désactivé pendant la soumission */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-2 text-white dark:text-black text-xl bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registering..." : "S'inscrire"}
          </button>
        </Form>

        {/* Redirection vers la page de login */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Vous avez déjà un compte?{" "}
          <Link
            to="/login"
            className="text-primary dark:text-light hover:text-dark dark:hover:text-primary transition duration-200"
          >
            Connectez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}