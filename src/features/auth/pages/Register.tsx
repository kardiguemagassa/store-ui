import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageTitle from "../../../shared/components/PageTitle";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { registerAsync } from "../store/authSlice";


// Types locaux
interface RegisterFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPwd: string;
}

// Type pour la visibilité des mots de passe
interface PasswordVisibility {password: boolean;confirmPwd: boolean;}

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // État local pour le formulaire
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPwd: ''
  });
  
  // ÉTAT POUR LA VISIBILITÉ DES MOTS DE PASSE
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
    password: false,
    confirmPwd: false
  });
  
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // État global depuis Redux
  const { error: reduxError } = useAppSelector(state => state.auth);

  // FONCTION POUR Basculer LA VISIBILITÉ
  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validation des mots de passe
  const validatePasswords = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.password !== formData.confirmPwd) {
      errors.confirmPwd = "Les mots de passe ne correspondent pas";
    }

    if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validation générale du formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Le nom est obligatoire";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }

    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Le numéro de portable est obligatoire";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = "Le numéro doit contenir 10 chiffres";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est obligatoire";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalErrors({});
    setIsLoading(true);

    // Validation côté client
    if (!validateForm() || !validatePasswords()) {
      setIsLoading(false);
      return;
    }

    console.log('📝 Registration attempt for:', formData.email);

    try {
      const result = await dispatch(registerAsync({
        username: formData.email,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        mobileNumber: formData.mobileNumber
      }));

      if (registerAsync.fulfilled.match(result)) {
        console.log('Registration successful');
        toast.success("Inscription réussie! Vous pouvez vous connecter.");
        
        // Redirection vers la page de login
        navigate("/login", { replace: true });
      } else if (registerAsync.rejected.match(result)) {
        console.log('Registration failed:', result.payload);
        
        const errorMessage = result.payload as string;
        const fieldErrors: Record<string, string> = {};
        
        // Détection par champ des erreurs backend
        if (errorMessage.includes('password') && errorMessage.includes('pattern')) {
          fieldErrors.password = "Doit contenir majuscule, minuscule, chiffre et caractère spécial (@$!%*?&#)";
        }
        
        if (errorMessage.includes('email') && (errorMessage.includes('déjà') || errorMessage.includes('existe'))) {
          fieldErrors.email = "Cet email est déjà utilisé";
        }
        
        if (errorMessage.includes('mobileNumber') && errorMessage.includes('pattern')) {
          fieldErrors.mobileNumber = "Le numéro doit contenir exactement 10 chiffres";
        }

        if (errorMessage.includes('name') && errorMessage.includes('vide')) {
          fieldErrors.name = "Le nom est obligatoire";
        }

        if (errorMessage.includes('email') && errorMessage.includes('invalide')) {
          fieldErrors.email = "Format d'email invalide";
        }
        
        // Mettre à jour les erreurs de champ
        if (Object.keys(fieldErrors).length > 0) {
          setLocalErrors(fieldErrors);
        }
        
        // Message toast global contextuel
        let toastMessage = "Veuillez corriger les erreurs du formulaire";
        if (errorMessage.includes('409')) {
          toastMessage = "Un compte existe déjà avec cet email";
        } else if (errorMessage.includes('pattern') && errorMessage.includes('password')) {
          toastMessage = "Format de mot de passe invalide";
        } else if (errorMessage.includes('validation')) {
          toastMessage = "Données d'inscription invalides";
        }
        
        toast.error(toastMessage);
      }
    } catch (err) {
      console.error('💥 Registration error:', err);
      toast.error('Erreur inattendue lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des changements de champs
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ quand l'utilisateur tape
    if (localErrors[name]) {
      setLocalErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Affichage des erreurs globales contextuelles
  const getGlobalErrorMessage = (): string => {
    if (!reduxError) return '';
    
    if (reduxError.includes('409')) {
      return "Un compte existe déjà avec cet email";
    } else if (reduxError.includes('pattern') && reduxError.includes('password')) {
      return "Le format du mot de passe est invalide";
    } else if (reduxError.includes('validation')) {
      return "Veuillez corriger les erreurs ci-dessus";
    }
    
    return reduxError;
  };

  const displayError = getGlobalErrorMessage();

  const labelStyle = "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle = "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";
  const errorInputStyle = "border-red-500 focus:ring-red-200 dark:focus:ring-red-800";

  //STYLE POUR LE BOUTON DE VISIBILITÉ
  const visibilityButtonStyle = "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200";

  return (
    <div className="min-h-[752px] flex items-center justify-center font-primary dark:bg-darkbg">
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6">
        <PageTitle title="Inscription" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
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
              value={formData.name}
              onChange={handleInputChange}
              className={`${textFieldStyle} ${localErrors.name ? errorInputStyle : ''}`}
            />
            {localErrors.name && (
              <p className="text-red-500 text-sm mt-1">{localErrors.name}</p>
            )}
          </div>

          {/* Email et Mobile Number */}
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
                value={formData.email}
                onChange={handleInputChange}
                className={`${textFieldStyle} ${localErrors.email ? errorInputStyle : ''}`}
              />
              {localErrors.email && (
                <p className="text-red-500 text-sm mt-1">{localErrors.email}</p>
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
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className={`${textFieldStyle} ${localErrors.mobileNumber ? errorInputStyle : ''}`}
              />
              {localErrors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">{localErrors.mobileNumber}</p>
              )}
            </div>
          </div>

          {/* MOT DE PASSE AVEC BOUTON DE VISIBILITÉ */}
          <div className="relative">
            <label htmlFor="password" className={labelStyle}>
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={passwordVisibility.password ? "text" : "password"}
                name="password"
                placeholder="Votre mot de passe sécurisé"
                required
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={formData.password}
                onChange={handleInputChange}
                className={`${textFieldStyle} pr-10 ${localErrors.password ? errorInputStyle : ''}`}
              />
              {/* BOUTON AFFICHER/MASQUER */}
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                className={visibilityButtonStyle}
                aria-label={passwordVisibility.password ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {passwordVisibility.password ? (
                  // Icône œil barré (masquer)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m4.242 4.242L14 14m-4.242-4.242l-4.242 4.242M9.878 9.878l-4.242-4.242" />
                  </svg>
                ) : (
                  // Icône œil (afficher)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Indications détaillées pour le mot de passe */}
            <div className="text-xs text-gray-500 dark:text-gray-300 mt-2 space-y-1">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                Au moins 8 caractères
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                1 lettre majuscule (A-Z)
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                1 lettre minuscule (a-z)
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                1 chiffre (0-9)
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                1 caractère spécial (@$!%*?&#)
              </div>
            </div>
            {localErrors.password && (
              <p className="text-red-500 text-sm mt-1">{localErrors.password}</p>
            )}
          </div>

          {/* CONFIRMATION MOT DE PASSE AVEC BOUTON DE VISIBILITÉ */}
          <div className="relative">
            <label htmlFor="confirmPwd" className={labelStyle}>
              Confirmez le mot de passe
            </label>
            <div className="relative">
              <input
                id="confirmPwd"
                type={passwordVisibility.confirmPwd ? "text" : "password"}
                name="confirmPwd"
                placeholder="Confirmez votre mot de passe"
                required
                autoComplete="confirm-password"
                minLength={8}
                maxLength={128}
                value={formData.confirmPwd}
                onChange={handleInputChange}
                className={`${textFieldStyle} pr-10 ${localErrors.confirmPwd ? errorInputStyle : ''}`}
              />
              {/* BOUTON AFFICHER/MASQUER */}
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPwd')}
                className={visibilityButtonStyle}
                aria-label={passwordVisibility.confirmPwd ? "Masquer la confirmation" : "Afficher la confirmation"}
              >
                {passwordVisibility.confirmPwd ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m4.242 4.242L14 14m-4.242-4.242l-4.242 4.242M9.878 9.878l-4.242-4.242" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {localErrors.confirmPwd && (
              <p className="text-red-500 text-sm mt-1">{localErrors.confirmPwd}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-2 text-white dark:text-black text-xl bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Inscription..." : "S'inscrire"}
          </button>

          {/* Affichage des erreurs globales */}
          {displayError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {displayError}
            </div>
          )}
        </form>

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