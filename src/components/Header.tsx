import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBasket,
  faTags,
  faSun,
  faMoon,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/redux"; 
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import type { User } from "../types/auth"; 

export default function Header() { 

  // ÉTAT DU THÈME - Gestion du mode sombre/clair avec persistance dans le localStorage
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  // VARIABLES D'ÉTAT - Gestion de l'ouverture/fermeture des menus déroulants
  const [isUserMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [isAdminMenuOpen, setAdminMenuOpen] = useState<boolean>(false);
  
  // HOOKS REACT ROUTER Navigation et localisation
  const location = useLocation();
  
  // RÉFÉRENCE - Pour détecter les clics en dehors du menu utilisateur
  const userMenuRef = useRef<HTMLDivElement>(null);

  // TOGGLES - Fonctions pour ouvrir/fermer les menus
  const toggleAdminMenu = () => setAdminMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  // HOOKS REDUX - Récupération des données du panier
  const totalQuantity = useAppSelector(state => 
    state.cart.reduce((acc, item) => acc + item.quantity, 0)
  );
  
  // HOOKS PERSONNALISÉS - Récupération des données d'authentification
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  // EFFET - Gestion du thème et de la fermeture des menus au clic externe
  useEffect(() => {
    // Quand le thème change, mets à jour le CSS AUTOMATIQUEMENT
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // "Quand l'utilisateur change de page, ferme les menus AUTOMATIQUEMENT"
    setAdminMenuOpen(false);
    setUserMenuOpen(false);
    
    // GESTIONNAIRE DE CLIC EXTERNE - Ferme les menus quand on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
        setAdminMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    // NETTOYAGE - Suppression de l'event listener au démontage
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [theme, location.pathname]); // Réexécuté quand le thème ou la route change

  // Bacule du thème avec persistance
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme); // Persistance dans le localStorage
      return newTheme;
    });
  };

  // DÉCONNEXION
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout();
    toast.success("Déconnexion réussie!");
  };

  // FONCTION POUR AFFICHER LE NOM DE L'UTILISATEUR
  const getUserDisplayName = (user: User | null): string => {
    if (!user) return "Hello User";
    
    // Utilisation sécurisée
    if (user.name) {
      return user.name.length > 8 
        ? `Hello ${user.name.slice(0, 8)}...`
        : `Hello ${user.name}`;
    }
    
    // username si disponible
    if (user.username) {
      return user.username.length > 8 
        ? `Hello ${user.username.slice(0, 8)}...`
        : `Hello ${user.username}`;
    }
    
    // email
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      return emailUsername.length > 8 
        ? `Hello ${emailUsername.slice(0, 8)}...`
        : `Hello ${emailUsername}`;
    }
    
    return "Hello User";
  };

  // CSS - Réutilisables
  const navLinkClass =
    "text-center text-lg font-primary font-semibold text-primary py-2 dark:text-light hover:text-dark dark:hover:text-lighter";

  const dropdownLinkClass =
    "block w-full text-left px-4 py-2 text-lg font-primary font-semibold text-primary dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600";

  return (
    <header className="border-b border-gray-300 dark:border-gray-600 sticky top-0 z-20 bg-normalbg dark:bg-darkbg">
      <div className="flex items-center justify-between mx-auto max-w-[1152px] px-6 py-4">
        <Link to="/" className={navLinkClass}>
          <FontAwesomeIcon icon={faTags} className="h-8 w-8" />
          <span className="font-bold">Eazy Stickers</span>
        </Link>
        <nav className="flex items-center py-2 z-10">
          {/* BOUTON THEME - Basculer entre mode sombre/clair */}
          <button
            className="flex items-center justify-center mx-3 w-8 h-8 rounded-full border border-primary dark:border-light transition duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <FontAwesomeIcon
              icon={theme === "dark" ? faMoon : faSun}
              className="w-4 h-4 dark:text-light text-primary"
            />
          </button>
          
          <ul className="flex space-x-6">
            {/* Navigation principale avec état actif */}
            <li>
              <NavLink
                to="/home"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Accueil
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                À propos
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Contact
              </NavLink>
            </li>
            
            {/* Affiché seulement si authentifié */}
            <li>
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="relative text-primary"
                  >
                    <span className={navLinkClass}>
                      {getUserDisplayName(user)} {/* Utilisation sécurisée */}
                    </span>
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      className="text-primary dark:text-light w-6 h-6"
                    />
                  </button>
                  
                  {/* MENU DÉROULANT UTILISATEUR */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 w-48 bg-normalbg dark:bg-darkbg border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 transition ease-in-out duration-200">
                      <ul className="py-2">
                        <li>
                          <Link to="/profile" className={dropdownLinkClass}>
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link to="/orders" className={dropdownLinkClass}>
                            Commandes
                          </Link>
                        </li>
                        
                        {/* admin */}
                        {isAdmin && (
                          <li>
                            <button
                              onClick={toggleAdminMenu}
                              className={`${dropdownLinkClass} flex items-center justify-between`}
                            >
                              Admin
                              <FontAwesomeIcon icon={faAngleDown} />
                            </button>
                            {isAdminMenuOpen && (
                              <ul className="ml-4 mt-2 space-y-2">
                                <li>
                                  <Link
                                    to="/admin/orders"
                                    className={dropdownLinkClass}
                                  >
                                    Commandes
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    to="/admin/messages"
                                    className={dropdownLinkClass}
                                  >
                                    Messages
                                  </Link>
                                </li>
                              </ul>
                            )}
                          </li>
                        )}

                        {/* DÉCONNEXION */}
                        <li>
                          <Link
                            to="/home"
                            onClick={handleLogout}
                            className={dropdownLinkClass}
                          >
                            Déconnexion
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                
                <NavLink
                  to="/login"
                  className={({ isActive }: { isActive: boolean }) =>
                    isActive ? `underline ${navLinkClass}` : navLinkClass
                  }
                >
                  Se connecter
                </NavLink>
              )}
            </li>
            
            {/* PANIER - Avec quantité */}
            <li>
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