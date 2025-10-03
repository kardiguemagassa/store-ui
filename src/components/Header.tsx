import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBasket,
  faTags,
  faSun,
  faMoon,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

export default function Header() { 
  // ⚡ ÉTAT DU THÈME - Gestion du mode sombre/clair avec persistance dans le localStorage
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  // 🎯 VARIABLES D'ÉTAT - Gestion de l'ouverture/fermeture des menus déroulants
  const isAdmin = true; // ⚠️ À remplacer par une logique d'authentification réelle
  const [isUserMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [isAdminMenuOpen, setAdminMenuOpen] = useState<boolean>(false);
  
  // 🎯 HOOKS REACT ROUTER - Navigation et localisation
  const location = useLocation();
  const navigate = useNavigate();
  
  // 🎯 RÉFÉRENCE - Pour détecter les clics en dehors du menu utilisateur
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 🎯 TOGGLES - Fonctions pour ouvrir/fermer les menus
  const toggleAdminMenu = () => setAdminMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  // 🎯 HOOKS PERSONNALISÉS - Récupération des données globales
  const { totalQuantity } = useCart();
  const { isAuthenticated, logout } = useAuth();

  // 🎯 EFFET - Gestion du thème et de la fermeture des menus au clic externe
  useEffect(() => {
    // Application du thème au document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Fermeture des menus lors du changement de route
    setAdminMenuOpen(false);
    setUserMenuOpen(false);
    
    // 🎯 GESTIONNAIRE DE CLIC EXTERNE - Ferme les menus quand on clique ailleurs
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
        setAdminMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    // 🧹 NETTOYAGE - Suppression de l'event listener au démontage
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [theme, location.pathname]); // Réexécuté quand le thème ou la route change

  // 🎯 BAScule du thème avec persistance
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme); // 💾 Persistance dans le localStorage
      return newTheme;
    });
  };

  // 🎯 DÉCONNEXION - Gestion de la déconnexion utilisateur
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout(); // Appel de la fonction de déconnexation du hook useAuth
    toast.success("Logged out successfully!");
    navigate("/home"); // Redirection vers la page d'accueil
  };

  // 🎯 CLASSES CSS - Réutilisables pour la stylisation
  const navLinkClass =
    "text-center text-lg font-primary font-semibold text-primary py-2 dark:text-light hover:text-dark dark:hover:text-lighter";

  const dropdownLinkClass =
    "block w-full text-left px-4 py-2 text-lg font-primary font-semibold text-primary dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600";

  return (
    <header className="border-b border-gray-300 dark:border-gray-600 sticky top-0 z-20 bg-normalbg dark:bg-darkbg">
      <div className="flex items-center justify-between mx-auto max-w-[1152px] px-6 py-4">
        {/* 🎯 LOGO - Lien vers la page d'accueil */}
        <Link to="/" className={navLinkClass}>
          <FontAwesomeIcon icon={faTags} className="h-8 w-8" />
          <span className="font-bold">Eazy Stickers</span>
        </Link>
        
        {/* 🎯 NAVIGATION PRINCIPALE */}
        <nav className="flex items-center py-2 z-10">
          {/* 🎯 BOUTON THEME - Basculer entre mode sombre/clair */}
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
            {/* 🎯 LIENS DE NAVIGATION - Navigation principale avec état actif */}
            <li>
              <NavLink
                to="/home"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }: { isActive: boolean }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                About
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
            
            {/* 🎯 MENU UTILISATEUR - Affiché seulement si authentifié */}
            <li>
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="relative text-primary"
                  >
                    <span className={navLinkClass}>Hello John Doe</span>
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      className="text-primary dark:text-light w-6 h-6"
                    />
                  </button>
                  
                  {/* 🎯 MENU DÉROULANT UTILISATEUR */}
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
                            Orders
                          </Link>
                        </li>
                        
                        {/* 🎯 SOUS-MENU ADMIN - Seulement pour les administrateurs */}
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
                                    Orders
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

                        {/* 🎯 DÉCONNEXION */}
                        <li>
                          <Link
                            to="/home"
                            onClick={handleLogout}
                            className={dropdownLinkClass}
                          >
                            Logout
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                // 🎯 LIEN DE CONNEXION - Si utilisateur non authentifié
                <NavLink
                  to="/login"
                  className={({ isActive }: { isActive: boolean }) =>
                    isActive ? `underline ${navLinkClass}` : navLinkClass
                  }
                >
                  Login
                </NavLink>
              )}
            </li>
            
            {/* 🎯 PANIER - Avec indicateur de quantité */}
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