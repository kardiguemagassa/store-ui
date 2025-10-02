import PageTitle from "./PageTitle";
import { Link } from "react-router-dom";

export default function Login() {
  // Styles réutilisables : définis comme constantes pour éviter la répétition
  // Pattern DRY (Don't Repeat Yourself)
  const labelStyle =
    "block text-lg font-semibold text-primary dark:text-light mb-2";
  const textFieldStyle =
    "w-full px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter bg-white dark:bg-gray-600 placeholder-gray-400 dark:placeholder-gray-300";
  
  return (
    // Container principal : centré verticalement et horizontalement
    <div className="min-h-[852px] flex items-center justify-center font-primary dark:bg-darkbg">
      
      {/* Carte de formulaire : max-width pour ne pas être trop large sur desktop */}
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6">
        
        {/* Titre de la page */}
        <PageTitle title="Se connecter" />
        
        {/* Formulaire de connexion */}
        {/* space-y-6 : espacement vertical entre les champs */}
        <form className="space-y-6">
          
          {/* Champ Username */}
          <div>
            <label htmlFor="username" className={labelStyle}>
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Votre nom d'utilisateur"
              required
              className={textFieldStyle}
            />
          </div>

          {/* Champ Password */}
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
              minLength={8}  
              maxLength={20} 
              className={textFieldStyle}
            />
          </div>

          <div>
            {/* type="submit" : déclenche la soumission du formulaire */}
            <button
              type="submit"
              className="w-full px-6 py-2 text-white dark:text-black text-xl rounded-md transition duration-200 bg-primary dark:bg-light hover:bg-dark dark:hover:bg-lighter"
            >
              Se connecter
            </button>
          </div>
        </form>

        {/* Lien vers la page d'inscription */}
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