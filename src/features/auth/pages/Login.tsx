import { useEffect, useState } from "react";
import PageTitle from "../../../shared/components/PageTitle";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginAsync } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logger } from "../../../shared/types/errors.types";

// TYPES LOCAUX
interface LoginFormData {
  username: string;
  password: string;
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // État local pour le formulaire
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });

  // ÉTAT POUR LA VISIBILITÉ DU MOT DE PASSE
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string>('');

  // État global depuis Redux
  const { error: reduxError, isAuthenticated } = useAppSelector(state => state.auth);

  // FONCTION POUR Basculer LA VISIBILITÉ
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError('');
    setIsLoading(true);

    // Validation simple
    if (!formData.username || !formData.password) {
      setLocalError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    logger.info('Tentative de connexion', 'Login', {
      username: formData.username
    });

    try {
      const result = await dispatch(loginAsync(formData));
      
      if (loginAsync.fulfilled.match(result)) {
        logger.info('Connexion réussie, redirection en cours', 'Login');
        toast.success("Connexion réussie!");
        
        // Redirection vers la page demandée ou /home
        const from = sessionStorage.getItem("redirectPath") || "/home";
        sessionStorage.removeItem("redirectPath");
        navigate(from, { replace: true });
      } else if (loginAsync.rejected.match(result)) {
        logger.warn('Échec de la connexion', 'Login', null, {
          error: result.payload
        });
        
        // MESSAGES D'ERREUR PLUS EXPLICITES
        let errorMessage = result.payload as string;
        
        // Traduction des erreurs courantes venu de backend 
        if (errorMessage.includes('400') || errorMessage.includes('validation')) {
          errorMessage = "Email ou mot de passe invalide. Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial.";
        } else if (errorMessage.includes('401')) {
          errorMessage = "Identifiants incorrects";
        } else if (errorMessage.includes('Erreur de validation des données')) {
          errorMessage = "Données de connexion invalides. Vérifiez votre email et mot de passe.";
        }
        
        setLocalError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      logger.error('Erreur inattendue lors de la connexion', 'Login', err);
      setLocalError('Erreur inattendue lors de la connexion');
      toast.error('Erreur inattendue lors de la connexion');
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
  };

  // Redirection si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      logger.info('Utilisateur déjà authentifié, redirection en cours', 'Login');
      const from = sessionStorage.getItem("redirectPath") || "/home";
      sessionStorage.removeItem("redirectPath");
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Affichage des erreurs (priorité à l'erreur locale)
  const displayError = localError || reduxError;

  const labelStyle = "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle = "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";
  
  // STYLE POUR LE BOUTON DE VISIBILITÉ
  const visibilityButtonStyle = "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200";

  return (
    <div className="min-h-[852px] flex items-center justify-center font-primary dark:bg-darkbg">
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6">
        <PageTitle title="Se connecter" />
        
        {/* FORM AVEC AFFICHAGE MOT DE PASSE */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className={labelStyle}>
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Votre nom d'utilisateur"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              className={textFieldStyle}
            />
          </div>
          
          {/* CHAMP MOT DE PASSE AVEC BOUTON DE VISIBILITÉ */}
          <div className="relative">
            <label htmlFor="password" className={labelStyle}>
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={128}
                value={formData.password}
                onChange={handleInputChange}
                className={`${textFieldStyle} pr-10`}
              />
              {/* BOUTON AFFICHER/MASQUER */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={visibilityButtonStyle}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
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
            {/* INDICATION POUR L'UTILISATEUR */}
            <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
              Cliquez sur l'icône pour afficher/masquer le mot de passe
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-2 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Authentification..." : "Se connecter"}
            </button>
          </div>

          {/* Affichage des erreurs */}
          {displayError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              Erreur: {displayError}
            </div>
          )}
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          Vous n'avez pas de compte ?{" "}
          <Link
            to="/register"
            className="text-primary dark:text-light hover:text-dark dark:hover:text-primary transition duration-200"
          >
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}