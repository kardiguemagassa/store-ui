import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import PageTitle from "./PageTitle";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { processPayment, createOrder } from "../actions/checkoutAction";
import type { ElementErrors } from "../types/payment";
import type { StripeElementChangeEvent } from "../types/payment";

export default function CheckoutForm() {
  // HOOKS - Récupération des données globales
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  // ÉTATS LOCAUX - Gestion de l'état du composant
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [elementErrors, setElementErrors] = useState<ElementErrors>({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  // CONFIGURATION - Thème et styles
  const isDarkMode = localStorage.getItem("theme") === "dark";

  const labelStyle = "block text-lg font-semibold text-primary dark:text-light mb-2";
  const fieldBaseClass = "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";
  const fieldErrorClass = "border-red-400 dark:border-red-500 focus:ring-red-500";
  const fieldValidClass = "border-primary dark:border-light focus:ring-dark dark:focus:ring-lighter";

  // FONCTION UTILITAIRE - Gestion des classes CSS conditionnelles
  const getClassForElement = (field: keyof ElementErrors): string =>
    `${fieldBaseClass} ${elementErrors[field] ? fieldErrorClass : fieldValidClass}`;

  // CONFIGURATION STRIPE - Options de style pour les éléments de carte
  const elementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: isDarkMode ? "#E5E7EB" : "#374151",
        backgroundColor: isDarkMode ? "#4B5563" : "#FFFFFF",
      },
      invalid: {
        color: "#F87171",
        backgroundColor: isDarkMode ? "#4B5563" : "#FFFFFF",
      },
    },
  };

  // GESTIONNAIRE D'ÉVÉNEMENT - Validation en temps réel des champs de carte
  const handleCardChange = (field: keyof ElementErrors, event: StripeElementChangeEvent): void => {
    setElementErrors((prev) => ({
      ...prev,
      [field]: event.error ? event.error.message : "",
    }));
  };

  // SOUMISSION DU FORMULAIRE - Flux complet de paiement
  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();

    // VALIDATIONS INITIALES - Vérifications de sécurité
    if (!stripe || !elements) {
      setErrorMessage("Stripe.js is not loaded yet.");
      return;
    }

    if (Object.values(elementErrors).some((error) => error)) {
      setErrorMessage("Please correct the highlighted errors.");
      return;
    }

    if (!user) {
      setErrorMessage("User information is missing.");
      return;
    }

    // DÉBUT DU TRAITEMENT - Mise à jour de l'état UI
    setIsProcessing(true);
    setErrorMessage("");

    try {
      // ÉTAPE 1: PROCESSUS DE PAIEMENT
      // Utilisation de la fonction externalisée pour plus de clarté
      const paymentResult = await processPayment({
        stripe,
        elements,
        user,
        cart,
        totalPrice,
        elementErrors // Important: passer les erreurs d'éléments pour validation
      });

      if (!paymentResult.success || !paymentResult.paymentIntent) {
        setErrorMessage(paymentResult.error || "Payment failed.");
        return;
      }

      // PAIEMENT RÉUSSI - Notification utilisateur
      toast.success("Payment successful!");

      // ÉTAPE 2: CRÉATION DE LA COMMANDE
      // Externalisation de la logique métier
      const orderResult = await createOrder(
        totalPrice, 
        paymentResult.paymentIntent, 
        cart
      );

      if (!orderResult.success) {
        setErrorMessage(orderResult.error || "Order creation failed.");
        return;
      }

      // SUCCÈS COMPLET - Nettoyage et redirection
      sessionStorage.setItem("skipRedirectPath", "true"); // Évite la redirection vers login
      clearCart(); // Vidage du panier
      navigate("/order-success"); // Redirection vers la page de succès

    } catch (error: unknown) {
      // GESTION D'ERREUR GLOBALE - Fallback sécurisé
      console.error("Checkout process error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      // FIN DU TRAITEMENT - Réinitialisation de l'état UI
      setIsProcessing(false);
    }
  };

  // RENDU DU COMPOSANT - Interface utilisateur
  return (
    <div className="min-h-[852px] flex items-center justify-center font-primary dark:bg-darkbg">
      {/* INDICATEUR DE CHARGEMENT - Pendant le traitement */}
      <div className={isProcessing ? "visible flex flex-col justify-center items-center my-[200px]" : "hidden"}>
        <p className="mt-4 text-2xl font-normal text-primary dark:text-light">
          Processing Payment.... Don't refresh the page
        </p>
      </div>

      {/* FORMULAIRE DE PAIEMENT - Masqué pendant le traitement */}
      <div className={isProcessing ? "hidden" : "visible bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6"}>
        <PageTitle title="Complete Your Payment" />

        {/* MONTANT TOTAL - Information claire pour l'utilisateur */}
        <p className="text-center mt-8 text-lg text-gray-600 dark:text-lighter mb-8">
          Amount to be charged: <strong>${totalPrice.toFixed(2)}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AFFICHAGE DES ERREURS GLOBALES */}
          {errorMessage && (
            <div className="text-red-500 text-sm text-center">
              {errorMessage}
            </div>
          )}
          
          {/* NUMÉRO DE CARTE - Élément Stripe sécurisé */}
          <div>
            <label htmlFor="cardNumber" className={labelStyle}>
              Card Number
            </label>
            <div id="cardNumber" className={getClassForElement("cardNumber")}>
              <CardNumberElement
                options={elementOptions}
                onChange={(event) => handleCardChange("cardNumber", event)}
              />
            </div>
            {elementErrors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">
                {elementErrors.cardNumber}
              </p>
            )}
          </div>

          {/* DATE D'EXPIRATION - Validation automatique */}
          <div>
            <label htmlFor="cardExpiry" className={labelStyle}>
              Expiry Date
            </label>
            <div id="cardExpiry" className={getClassForElement("cardExpiry")}>
              <CardExpiryElement
                options={elementOptions}
                onChange={(event) => handleCardChange("cardExpiry", event)}
              />
            </div>
            {elementErrors.cardExpiry && (
              <p className="text-red-500 text-sm mt-1">
                {elementErrors.cardExpiry}
              </p>
            )}
          </div>

          {/* CODE CVC - Sécurité renforcée */}
          <div>
            <label htmlFor="cardCvc" className={labelStyle}>
              CVC
            </label>
            <div id="cardCvc" className={getClassForElement("cardCvc")}>
              <CardCvcElement
                options={elementOptions}
                onChange={(event) => handleCardChange("cardCvc", event)}
              />
            </div>
            {elementErrors.cardCvc && (
              <p className="text-red-500 text-sm mt-1">
                {elementErrors.cardCvc}
              </p>
            )}
          </div>

          {/* BOUTON DE SOUMISSION - Contrôles d'accessibilité */}
          <div>
            <button
              type="submit"
              disabled={!stripe || isProcessing}
              className="w-full px-6 py-2 mt-6 text-white dark:text-black text-xl bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Payment processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}