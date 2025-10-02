import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBasket,
  faTags,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
//import { useCart } from "../hooks/useCart";
//import { useCart } from "../store/cart-context";
import { useCart } from "../hooks/useCart";


export default function Header() { 

  // Gestion du thème dark/light mode
  // Initialisation : on vérifie si l'utilisateur a déjà une préférence sauvegardée
  // Sinon, on utilise le mode "light" par défaut
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  const { totalQuantity } = useCart();

  // Effet secondaire : applique le thème au DOM à chaque changement
  // Le thème "dark" ajoute la classe "dark" à <html>, ce qui active les styles Tailwind dark:*
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]); // Se déclenche uniquement quand "theme" change

  // Toggle du thème : bascule entre light et dark
  // Utilise le pattern fonctionnel de setState pour garantir la cohérence
  // Persiste le choix dans localStorage pour le retrouver au prochain chargement
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme); // 💾 Sauvegarde persistante
      return newTheme;
    });
  };

  // Classes CSS réutilisables pour tous les liens de navigation
  // Utilise les variants Tailwind dark:* pour s'adapter automatiquement au thème
  const navLinkClass =
    "text-center text-lg font-primary font-semibold text-primary py-2 dark:text-light hover:text-dark dark:hover:text-lighter";

  return (
    //  Header sticky : reste visible en haut lors du scroll
    // z-20 : s'assure que le header reste au-dessus des autres éléments
    <header className="border-b border-gray-300 dark:border-gray-600 sticky top-0 z-20 bg-normalbg dark:bg-darkbg">
      {/* 📐 Container principal : largeur maximale de 1152px, centré */}
      <div className="flex items-center justify-between mx-auto max-w-[1152px] px-6 py-4">

        {/* Logo/Brand : retour à l'accueil */}
        <Link to="/" className={navLinkClass}>
          <FontAwesomeIcon icon={faTags} className="h-8 w-8" />
          <span className="font-bold">Magasin d'autocollants</span>
        </Link>

        {/* Navigation principale */}
        <nav className="flex items-center py-2 z-10">
          
          {/* Bouton de toggle du thème (Soleil/Lune) */}
          {/* aria-label : important pour l'accessibilité (lecteurs d'écran) */}
          <button
            className="flex items-center justify-center mx-3 w-8 h-8 rounded-full border border-primary dark:border-light transition duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {/* Icône dynamique : change selon le thème actif */}
            <FontAwesomeIcon
              icon={theme === "dark" ? faMoon : faSun}
              className="w-4 h-4 dark:text-light text-primary"
            />
          </button>

          {/* Liste des liens de navigation */}
          <ul className="flex space-x-6">
            <li>
              {/* 🔗 NavLink : comme Link, mais avec détection de route active */}
              {/* isActive : React Router détecte automatiquement si cette route est active */}
              <NavLink 
                to="/home" 
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Accueil
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/about" 
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                À propos
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/contact" 
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Contact
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/login" 
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Se connecter
              </NavLink>
            </li>
            <li>
              {/* Panier : utilise Link au lieu de NavLink car pas besoin de détection active */}
              <Link to="/cart" className=" relative text-primary py-2">
                <FontAwesomeIcon
                  icon={faShoppingBasket}
                  className="text-primary dark:text-light w-6"
                />
                <div className="absolute -top-2 -right-6 text-xs bg-yellow-400 text-black font-semibold rounded-full px-2 py-1 leading-none">
                  {totalQuantity}
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}