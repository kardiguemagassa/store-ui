import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../shared/components/PageTitle";
import { toast } from "react-toastify";
import { useAuth } from "../../auth/hooks/useAuth";
import { clearCart, selectCartItems, selectTotalPrice } from "../../cart/store/cartSlice";

import type { ElementErrors } from "../types/payment.pytes";
import type { StripeElementChangeEvent } from "../types/payment.pytes";
import { useAppDispatch, useAppSelector } from "../../auth/hooks/redux";
import { createOrder, processPayment } from "../services/paymentService";
import apiClient from "../../../shared/api/apiClient";
import { handleApiError, logger } from "../../../shared/types/errors.types";


export default function CheckoutForm() {
  // HOOKS - Récupération des données globales AVEC REDUX
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCartItems); 
  const totalPrice = useAppSelector(selectTotalPrice); 
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

    // VALIDATIONS INITIALES
    if (!stripe || !elements) {
      setErrorMessage("Stripe.js n'est pas encore chargé.");
      return;
    }

    if (Object.values(elementErrors).some((error) => error)) {
      setErrorMessage("Veuillez corriger les erreurs surlignées.");
      return;
    }

    if (!user) {
      setErrorMessage("Les informations utilisateur sont manquantes.");
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("Votre panier est vide.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // CONVERSION PRIX EN CENTIMES (UNE SEULE FOIS)
      const amountInCents = Math.round(totalPrice * 100);
      
      logger.info("Prix traitement", "CheckoutForm", {
        totalPriceEuros: totalPrice,
        amountInCents: amountInCents,
        cartItems: cart.length
      });

      // ÉTAPE 1: PROCESSUS DE PAIEMENT
      const paymentResult = await processPayment({
        stripe,
        elements,
        user,
        cart,
        totalPrice: amountInCents // EN CENTIMES
      });

      if (!paymentResult.success || !paymentResult.paymentIntent) {
        logger.error("Échec du processus de paiement", "CheckoutForm", null, {
          error: paymentResult.error,
          userId: user.id
        });
        setErrorMessage(paymentResult.error || "Le paiement a échoué.");
        return;
      }

      toast.success("Paiement effectué avec succès !");

      // FORCER RÉCUPÉRATION DU TOKEN CSRF
      logger.debug("Récupération du token CSRF", "CheckoutForm");
      
      // Option A: Requête GET pour régénérer le token
      try {
        await apiClient.get('/csrf-token');
      } catch (error) {
        logger.warn("Endpoint /csrf-token non disponible", "CheckoutForm", error);
      }

      // Option B: Attendre 1 seconde
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Vérifier disponibilité du token
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      
      logger.debug("Statut CSRF Token", "CheckoutForm", {
        csrfTokenAvailable: !!csrfToken
      });

      if (!csrfToken) {
        logger.error("CSRF Token manquant après attente", "CheckoutForm");
        // Continuer quand même, l'erreur sera gérée par createOrder
      }

      // ÉTAPE 2: CRÉATION DE LA COMMANDE
      const orderResult = await createOrder(
        totalPrice, // EN EUROS pour la base de données
        paymentResult.paymentIntent,
        cart
      );

      if (!orderResult.success) {
        logger.error("Échec de la création de commande", "CheckoutForm", null, {
          error: orderResult.error,
          paymentIntentId: paymentResult.paymentIntent.id
        });
        setErrorMessage(orderResult.error || "La commande a échoué.");
        return;
      }

      // SUCCÈS
      logger.info("Commande créée avec succès", "CheckoutForm", {
        orderId: orderResult.orderId,
        paymentIntentId: paymentResult.paymentIntent.id,
        totalAmount: totalPrice
      });
      
      sessionStorage.setItem("skipRedirectPath", "true");
      dispatch(clearCart());
      navigate("/order-success");

    } catch (error: unknown) {
      const errorInfo = handleApiError(error);
      logger.error("Erreur lors du processus de checkout", "CheckoutForm", error, {
        errorMessage: errorInfo.message,
        status: errorInfo.status,
        userId: user?.id
      });
      setErrorMessage(errorInfo.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[852px] flex items-center justify-center font-primary dark:bg-darkbg">
      {/* INDICATEUR DE CHARGEMENT - Pendant le traitement */}
      <div className={isProcessing ? "visible flex flex-col justify-center items-center my-[200px]" : "hidden"}>
        <p className="mt-4 text-2xl font-normal text-primary dark:text-light">
          Traitement du paiement.... Ne pas actualiser la page
        </p>
      </div>

      {/* FORMULAIRE DE PAIEMENT - Masqué pendant le traitement */}
      <div className={isProcessing ? "hidden" : "visible bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6"}>
        <PageTitle title="Terminez votre paiement" />

        {/* MONTANT TOTAL - Information claire pour l'utilisateur */}
        <p className="text-center mt-8 text-lg text-gray-600 dark:text-lighter mb-8">
          Montant à facturer : <strong>{totalPrice.toFixed(2)} €</strong>
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
              Numéro de carte
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
              Date d'expiration
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
              {isProcessing ? "Traitement des paiements..." : "Payer maintenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}