import PageTitle from "./PageTitle";
import type { ActionData, ProfileData } from "../types/profile";
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Profile() {
  // HOOKS REACT ROUTER - Typage des données
  const initialProfileData = useLoaderData() as ProfileData;
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const navigate = useNavigate();
  
  const isSubmitting = navigation.state === "submitting";
  const { logout } = useAuth();

  // ÉTAT LOCAL - Gestion des données du profil avec valeurs par défaut
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

  // EFFET - Gestion des réponses après soumission
  useEffect(() => {
    if (actionData?.success) {
      if (actionData.profileData?.emailUpdated) {
        sessionStorage.setItem("skipRedirectPath", "true");
        logout();
        toast.success(
          "Logged out successfully! Login again with updated email"
        );
        navigate("/login");
      } else {
        toast.success("Your Profile details are saved successfully!");
        if (actionData.profileData) {
          setProfileData(actionData.profileData);
        }
      }
    }
  }, [actionData, logout, navigate]);

  // STYLES - Classes CSS réutilisables
  const labelStyle = "block text-lg font-semibold text-primary dark:text-light mb-2";
  const h2Style = "block text-2xl font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle = "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";

  // 🎯 FONCTION POUR METTRE À JOUR L'ADRESSE
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
      <PageTitle title="My Profile" />

      <Form method="PUT" className="space-y-6 max-w-[768px] mx-auto">
        {/* INFORMATIONS PERSONNELLES */}
        <div>
          <h2 className={h2Style}>Personal Details</h2>
          <label htmlFor="name" className={labelStyle}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your Name"
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
              placeholder="Your Email"
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
              Mobile Number
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="tel"
              required
              pattern="^\d{10}$"
              title="Mobile number must be exactly 10 digits"
              value={profileData.mobileNumber}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  mobileNumber: e.target.value,
                }))
              }
              placeholder="Your Mobile Number"
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
          <h2 className={h2Style}>Address Details</h2>
          <label htmlFor="street" className={labelStyle}>
            Street
          </label>
          <input
            id="street"
            name="street"
            type="text"
            placeholder="Street details"
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
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Your City"
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
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              required
              minLength={2}
              maxLength={30}
              placeholder="Your State"
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
              Postal Code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              placeholder="Your Postal Code"
              value={profileData.address.postalCode}
              onChange={(e) => updateAddressField('postalCode', e.target.value)}
              className={textFieldStyle}
              required
              pattern="^\d{5}$"
              title="Postal code must be exactly 5 digits"
            />
            {actionData?.errors?.postalCode && (
              <p className="text-red-500 text-sm mt-1">
                {actionData.errors.postalCode}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="country" className={labelStyle}>
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              minLength={2}
              maxLength={2}
              placeholder="Your Country"
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
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
    </div>
  );
}