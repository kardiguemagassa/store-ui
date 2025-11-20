import { logger } from '../types/errors.types';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

// Composant de pagination réutilisable
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Validation des props
  if (totalPages <= 1) {
    return null;
  }

  if (currentPage < 0 || currentPage >= totalPages) {
    logger.warn("Page actuelle hors limites", "Pagination", {
      // DONNÉES LIMITÉES - pas de valeurs spécifiques
      issue: "current_page_out_of_bounds",
      totalPagesRange: ">1" // Plutôt que le nombre exact
    });
    return null;
  }

  /**
   * Changer de page avec callback et scroll
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      // seulement l'action utilisateur
      logger.info("Changement de page utilisateur", "Pagination", {
        action: "page_navigation",
        direction: newPage > currentPage ? "next" : "previous"
      });
      
      onPageChange(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // LOG SÉCURISÉ - pas de valeurs spécifiques
      logger.warn("Navigation page invalide bloquée", "Pagination", {
        issue: "invalid_page_request",
        requestType: "out_of_bounds"
      });
    }
  };

  //  Générer les numéros de pages à afficher intelligemment
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(0, 1, 2, 3, "...", totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push(0, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages - 1);
      }
    }

    return pages;
  };

  /**
   * Rendu d'un bouton de page
   */
  const renderPageButton = (page: number | string, index: number) => {
    if (page === "...") {
      return (
        <span
          key={`ellipsis-${index}`}
          className="px-3 py-2 text-gray-500 dark:text-gray-400 font-medium"
          aria-hidden="true"
        >
          ...
        </span>
      );
    }

    const pageNumber = page as number;
    const isActive = pageNumber === currentPage;
    const isDisabled = pageNumber < 0 || pageNumber >= totalPages;

    return (
      <button
        key={pageNumber}
        onClick={() => !isDisabled && handlePageChange(pageNumber)}
        disabled={isDisabled}
        className={`
          min-w-[44px] px-3 py-2 rounded-md font-medium transition-all duration-200
          border border-transparent
          ${isActive
            ? "bg-primary text-white border-primary shadow-md"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:scale-105"
          }
        `}
        aria-label={`Aller à la page ${pageNumber + 1}`}
        aria-current={isActive ? "page" : undefined}
      >
        {pageNumber + 1}
      </button>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 mb-8 px-4">
      {/* Informations de pagination */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage + 1} sur {totalPages}
      </div>

      {/* Contrôles de pagination */}
      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="
            px-4 py-2 rounded-md font-medium transition-all duration-200
            bg-primary text-white border border-primary
            hover:bg-dark hover:border-dark
            disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed
            flex items-center gap-2
          "
          aria-label="Page précédente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>

        {/* Numéros de pages */}
        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => renderPageButton(page, index))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="
            px-4 py-2 rounded-md font-medium transition-all duration-200
            bg-primary text-white border border-primary
            hover:bg-dark hover:border-dark
            disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed
            flex items-center gap-2
          "
          aria-label="Page suivante"
        >
          Suivant
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Sélecteur de page rapide */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="page-select" className="text-gray-600 dark:text-gray-400">
            Aller à:
          </label>
          <select
            id="page-select"
            value={currentPage}
            onChange={(e) => {
              const newPage = Number(e.target.value);
              // LOG MINIMAL - action utilisateur seulement
              logger.debug("Navigation via sélecteur", "Pagination", {
                action: "select_navigation"
              });
              handlePageChange(newPage);
            }}
            className="
              px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md
              bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            "
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i} value={i}>
                Page {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}