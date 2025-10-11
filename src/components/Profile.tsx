import type { ActionData } from "../types/errors";
import PageTitle from "./PageTitle";
import type { ProfileData } from "../types/profile";
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

export default function Profile() {
  const initialProfileData = useLoaderData() as ProfileData;
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const isSubmitting = navigation.state === "submitting";
  const { logout } = useAuth();
  
  // useRef pour suivre l'état de traitement
  const hasProcessedAction = useRef(false);
  const lastActionData = useRef<ActionData | undefined>(undefined);

  const [profileData, setProfileData] = useState<ProfileData>(() => ({
    name: initialProfileData.name || "",
    email: initialProfileData.email || "",
    mobileNumber: initialProfileData.mobileNumber || "",
    address: {
      street: initialProfileData.address?.street || "",
      city: initialProfileData.address?.city || "",
      state: initialProfileData.address?.state || "",
      postalCode: initialProfileData.address?.postalCode || "",
      country: initialProfileData.address?.country || "",
    }
  }));

  // UN SEUL useEffect POUR TOUT GÉRER
  useEffect(() => {
    // Reset quand on commence une nouvelle soumission
    if (isSubmitting) {
      hasProcessedAction.current = false;
      lastActionData.current = undefined;
      return;
    }
    // Si pas d'actionData ou déjà traité, on sort
    if (!actionData || hasProcessedAction.current) {return;}

    // Si c'est le même actionData que le précédent, on sort
    if (actionData === lastActionData.current) {return;}
    
    // Marquer comme traité et sauvegarder la référence
    hasProcessedAction.current = true;
    lastActionData.current = actionData;

    if (actionData.success && actionData.profileData) {
      if (actionData.profileData.emailUpdated) {
        sessionStorage.setItem("skipRedirectPath", "true");
        logout();
        toast.success("Déconnexion réussie! Reconnectez-vous avec une adresse e-mail mise à jour.");
        navigate("/login");
      } else {
        toast.success("Les détails de votre profil ont été enregistrés avec succès!");
        setProfileData(actionData.profileData);
      }
    } else if (actionData.errors) {
      toast.error("Veuillez corriger les erreurs dans le formulaire");
    }
  }, [actionData, isSubmitting, logout, navigate]);

  const labelStyle = "block text-lg font-semibold text-primary dark:text-light mb-2";
  const h2Style = "block text-2xl font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle = "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";

  const updateAddressField = (field: keyof ProfileData['address'], value: string) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-[1152px] min-h-[852px] mx-auto px-6 py-8 font-primary bg-normalbg dark:bg-darkbg">
      <PageTitle title="Mon profil" />

      <Form method="POST" className="space-y-6 max-w-[768px] mx-auto">
        {/* INFORMATIONS PERSONNELLES */}
        <div>
          <h2 className={h2Style}>Informations personnelles</h2>
          <label htmlFor="name" className={labelStyle}>
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Votre Nom"
            className={textFieldStyle}
            value={profileData.name}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            minLength={5}
            maxLength={30}
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
              name="email"
              type="email"
              placeholder="Votre Email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, email: e.target.value }))
              }
              className={textFieldStyle}
              required
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
              name="mobileNumber"
              type="tel"
              required
              pattern="^\d{10}$"
              title="Le numéro de téléphone portable doit comporter exactement 10 chiffres"
              value={profileData.mobileNumber}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  mobileNumber: e.target.value,
                }))
              }
              placeholder="Votre Numéro portable"
              className={textFieldStyle}
            />
            {actionData?.errors?.mobileNumber && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.mobileNumber}
              </p>
            )}
          </div>
        </div>

        {/* ADRESSE */}
        <div>
          <h2 className={h2Style}>Détails de l'adresse</h2>
          <label htmlFor="street" className={labelStyle}>
            Rue
          </label>
          <input
            id="street"
            name="street"
            type="text"
            placeholder="Détails de la rue"
            value={profileData.address.street} 
            onChange={(e) => updateAddressField('street', e.target.value)}
            className={textFieldStyle}
            required
            minLength={5}
            maxLength={30}
          />
          {actionData?.errors?.street && (
            <p className="text-red-500 text-sm mt-1">
              {actionData.errors.street}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className={labelStyle}>
              Ville
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Votre ville"
              value={profileData.address.city}
              onChange={(e) => updateAddressField('city', e.target.value)}
              className={textFieldStyle}
              required
              minLength={3}
              maxLength={30}
            />
            {actionData?.errors?.city && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.city}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="state" className={labelStyle}>
              Département
            </label>
            <input
              id="state"
              name="state"
              type="text"
              required
              minLength={2}
              maxLength={30}
              placeholder="Votre département"
              value={profileData.address.state}
              onChange={(e) => updateAddressField('state', e.target.value)}
              className={textFieldStyle}
            />
            {actionData?.errors?.state && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.state}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="postalCode" className={labelStyle}>
              Code Postal
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              placeholder="Votre code postal"
              value={profileData.address.postalCode}
              onChange={(e) => updateAddressField('postalCode', e.target.value)}
              className={textFieldStyle}
              required
              pattern="^\d{5}$"
              title="Le code postal doit comporter exactement 5 chiffres"
            />
            {actionData?.errors?.postalCode && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.postalCode}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="country" className={labelStyle}>
              Pays
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              minLength={2}
              maxLength={2}
              placeholder="Votre pays"
              value={profileData.address.country}
              onChange={(e) => updateAddressField('country', e.target.value)}
              className={textFieldStyle}
            />
            {actionData?.errors?.country && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.country}
              </p>
            )}
          </div>
        </div>

        {/* BOUTON DE SAUVEGARDE */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 mt-8 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </Form>
    </div>
  );
}