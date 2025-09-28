import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      Fabriqué avec
      <FontAwesomeIcon
        icon={faHeart}
        className="footer-icon"
        aria-hidden="true"
      />
      des
      <a href="#" target="_blank" rel="noreferrer">
        autocollants de magasin
      </a>
    </footer>
  );
}