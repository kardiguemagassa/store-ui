import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";


export default function Footer() {
  return (
    <footer className="flex justify-center items-center py-4 font-primary text-gray-700 dark:text-gray-300">
      Fabriqué avec
      <FontAwesomeIcon
        icon={faHeart}
        className="text-red-600 mx-1 animate-pulse"
        aria-hidden="true"
      />
      des
      <a href="#" 
      target="_blank" 
      rel="noreferrer"
      className="text-primary dark:text-light font-semibold px-1 transition-colors duration-300 hover:text-dark dark:hover:text-lighter"
      
      >
        autocollants de magasin
      </a>
    </footer>
  );
}