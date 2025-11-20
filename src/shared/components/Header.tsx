import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBasket,
  faTags,
  faSun,
  faMoon,
  faAngleDown,
  faBox,
  faEnvelope,
  faUsers,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { useAppSelector } from "../../features/auth/hooks/redux";
import { useAuth } from "../../features/auth/hooks/useAuth";
import type { User } from "../../features/auth/types/auth.types";
import { selectTotalQuantity } from "../../features/cart/store/cartSlice";

export default function Header() {
  
  // STATE - GESTION DU THÈME
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  });

  // STATE - MENUS DÉROULANTS
  const [isUserMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [isAdminMenuOpen, setAdminMenuOpen] = useState<boolean>(false);

  // HOOKS - REACT ROUTER
  const location = useLocation();

  // REFS - DÉTECTION CLIC EXTERNE
  //Type explicite avec null
  const userMenuRef = useRef<HTMLDivElement | null>(null);

 
  // REDUX - PANIER
  const totalQuantity = useAppSelector(selectTotalQuantity);

  // HOOKS - AUTHENTIFICATION
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  // EFFETS - THÈME & MENUS
  useEffect(() => {
    // Appliquer le thème
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Fermer les menus au changement de page
    setAdminMenuOpen(false);
    setUserMenuOpen(false);

    // Gestionnaire de clic externe
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [theme, location.pathname]);

  // HANDLERS

 // Toggle du thème avec persistance
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  //Toggle du menu utilisateur
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  // Toggle du menu admin
  const toggleAdminMenu = () => setAdminMenuOpen((prev) => !prev);

  //Déconnexion
  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout();
    toast.success("Déconnexion réussie!");
  };

   //Affichage du nom utilisateur (tronqué si trop long)
  const getUserDisplayName = (user: User | null): string => {
    if (!user) return "Hello User";

    // Priorité: name > username > email
    if (user.name) {
      return user.name.length > 8
        ? `Hello ${user.name.slice(0, 8)}...`
        : `Hello ${user.name}`;
    }

    if (user.username) {
      return user.username.length > 8
        ? `Hello ${user.username.slice(0, 8)}...`
        : `Hello ${user.username}`;
    }

    if (user.email) {
      const emailUsername = user.email.split("@")[0];
      return emailUsername.length > 8
        ? `Hello ${emailUsername.slice(0, 8)}...`
        : `Hello ${emailUsername}`;
    }

    return "Hello User";
  };

  // CSS CLASSES

  const navLinkClass =
    "text-center text-lg font-primary font-semibold text-primary py-2 dark:text-light hover:text-dark dark:hover:text-lighter";

  const dropdownLinkClass =
    "block w-full text-left px-4 py-2 text-lg font-primary font-semibold text-primary dark:text-light hover:bg-gray-100 dark:hover:bg-gray-600";

  // RENDER

  return (
    <header className="border-b border-gray-300 dark:border-gray-600 sticky top-0 z-20 bg-normalbg dark:bg-darkbg">
      <div className="flex items-center justify-between mx-auto max-w-[1152px] px-6 py-4">
        
        {/* LOGO */}
        <Link to="/" className={navLinkClass}>
          <FontAwesomeIcon icon={faTags} className="h-8 w-8" />
          <span className="font-bold">Eazy Stickers</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center py-2 z-10">
          
          {/* BOUTON THÈME */}
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

          {/* MENU PRINCIPAL */}
          <ul className="flex space-x-6">
            
            {/* ACCUEIL */}
            <li>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive ? `underline ${navLinkClass}` : navLinkClass
                }
              >
                Accueil
              </NavLink>
            </li>

            {/* À PROPOS */}
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

            {/* CONTACT */}
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

            {/* MENU UTILISATEUR / CONNEXION */}
            <li>
              {isAuthenticated ? (
                <UserMenu
                  user={user}
                  isUserMenuOpen={isUserMenuOpen}
                  isAdminMenuOpen={isAdminMenuOpen}
                  isAdmin={isAdmin}
                  userMenuRef={userMenuRef}
                  toggleUserMenu={toggleUserMenu}
                  toggleAdminMenu={toggleAdminMenu}
                  handleLogout={handleLogout}
                  getUserDisplayName={getUserDisplayName}
                  navLinkClass={navLinkClass}
                  dropdownLinkClass={dropdownLinkClass}
                />
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? `underline ${navLinkClass}` : navLinkClass
                  }
                >
                  Se connecter
                </NavLink>
              )}
            </li>

            {/* PANIER */}
            <li>
              <CartButton totalQuantity={totalQuantity} />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

// COMPOSANTS EXTRAITS

 //Menu utilisateur (authentifié)
interface UserMenuProps {
  user: User | null;
  isUserMenuOpen: boolean;
  isAdminMenuOpen: boolean;
  isAdmin: boolean | undefined;
  userMenuRef: React.RefObject<HTMLDivElement | null>; // Type avec null
  toggleUserMenu: () => void;
  toggleAdminMenu: () => void;
  handleLogout: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  getUserDisplayName: (user: User | null) => string;
  navLinkClass: string;
  dropdownLinkClass: string;
}

const UserMenu = ({
  user,
  isUserMenuOpen,
  isAdminMenuOpen,
  isAdmin,
  userMenuRef,
  toggleUserMenu,
  toggleAdminMenu,
  handleLogout,
  getUserDisplayName,
  navLinkClass,
  dropdownLinkClass,
}: UserMenuProps) => (
  <div className="relative" ref={userMenuRef}>
    <button onClick={toggleUserMenu} className="relative text-primary">
      <span className={navLinkClass}>{getUserDisplayName(user)}</span>
      <FontAwesomeIcon
        icon={faAngleDown}
        className="text-primary dark:text-light w-6 h-6"
      />
    </button>

    {/* MENU DÉROULANT */}
    {isUserMenuOpen && (
      <div className="absolute right-0 w-48 bg-normalbg dark:bg-darkbg border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20 transition ease-in-out duration-200">
        <ul className="py-2">
          {/* PROFIL */}
          <li>
            <Link to="/profile" className={dropdownLinkClass}>
              Profile
            </Link>
          </li>

          {/* COMMANDES */}
          <li>
            <Link to="/orders" className={dropdownLinkClass}>
              Commandes
            </Link>
          </li>

          {/* MENU ADMIN */}
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
                    <Link to="/admin/orders" className={dropdownLinkClass}>
                     <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                      Commandes
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/products" className={dropdownLinkClass}>
                    <FontAwesomeIcon icon={faBox} className="mr-2" />
                      Produits
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/messages" className={dropdownLinkClass}>
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      Messages
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/users" className={dropdownLinkClass}>
                    <FontAwesomeIcon icon={faUsers} className="mr-2" />
                      Utilisateurs
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          <li>
            <Link to="/home" onClick={handleLogout} className={dropdownLinkClass}>
              Déconnexion
            </Link>
          </li>
        </ul>
      </div>
    )}
  </div>
);

interface CartButtonProps {
  totalQuantity: number;
}

const CartButton = ({ totalQuantity }: CartButtonProps) => (
  <Link to="/cart" className="relative text-primary py-2">
    <FontAwesomeIcon
      icon={faShoppingBasket}
      className="text-primary dark:text-light w-6"
    />
    {totalQuantity > 0 && (
      <div className="absolute -top-2 -right-6 text-xs bg-yellow-400 text-black font-semibold rounded-full px-2 py-1 leading-none">
        {totalQuantity}
      </div>
    )}
  </Link>
);
