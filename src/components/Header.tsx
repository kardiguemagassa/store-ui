import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBasket, faTags } from "@fortawesome/free-solid-svg-icons";


export default function  Header () { 
    return (
        <header className="header">
      <div className="container">
        <a href="/" className="link">
          <FontAwesomeIcon icon={faTags} className="fa-icon" />
          <span className="brand-title">Magasin d'autocollants</span>
        </a>
        <nav className="nav">
          <ul>
            <li>
              <a href="/" className="nav-link">
                Accueil
              </a>
            </li>
            <li>
              <a href="/about" className="nav-link">
                À propos
              </a>
            </li>
            <li>
              <a href="/contact" className="nav-link">
                Contact
              </a>
            </li>
            <li>
              <a href="/login" className="nav-link">
                Se connecter
              </a>
            </li>
            <li>
              <a href="/cart" className="nav-link">
                <FontAwesomeIcon icon={faShoppingBasket} />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    );
}