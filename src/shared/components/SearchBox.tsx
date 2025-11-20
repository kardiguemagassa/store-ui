import { useState, useEffect, useRef } from 'react';
import { logger } from '../types/errors.types';

interface SearchBoxProps {
  label: string;
  placeholder: string;
  value: string;
  handleSearch: (query: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  debounceMs?: number; 
}

export default function SearchBox({
  label,
  placeholder,
  value,
  handleSearch,
  onClear,
  disabled = false,
  debounceMs = 300 // Valeur par défaut
}: SearchBoxProps) {
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<number | undefined>(undefined);

  // Synchronisation avec la valeur externe
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();
    logger.info("Recherche soumise", "SearchBox", { query: trimmedValue });
    handleSearch(trimmedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear le debounce précédent
    if (debounceRef.current !== undefined) {
      window.clearTimeout(debounceRef.current);
    }

    // Déclencher la recherche après debounce seulement si la valeur a changé
    if (newValue.trim() !== value) {
      debounceRef.current = window.setTimeout(() => {
        const trimmedValue = newValue.trim();
        logger.debug("Recherche temps réel déclenchée", "SearchBox", { 
          query: trimmedValue,
          debounceMs 
        });
        handleSearch(trimmedValue);
      }, debounceMs);
    }
  };

  const handleClearClick = () => {
    logger.info("Recherche effacée", "SearchBox");
    
    // Clear le debounce
    if (debounceRef.current !== undefined) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
    }
    
    // Réinitialiser l'état local
    setInputValue('');
    
    // Déclencher la recherche vide
    handleSearch('');
    
    // Appeler le callback clear
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      logger.debug("Recherche via touche Entrée", "SearchBox", { query: trimmedValue });
      handleSearch(trimmedValue);
    } else if (e.key === 'Escape') {
      logger.debug("Effacement via touche Échap", "SearchBox");
      handleClearClick();
    }
  };

  // Nettoyer le timeout à la destruction
  useEffect(() => {
    return () => {
      if (debounceRef.current !== undefined) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-md">
      <label htmlFor="search" className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          name="search"
          id="search"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors"
          autoComplete="off"
          aria-describedby="search-description"
        />
        
        {/* Description pour l'accessibilité */}
        <div id="search-description" className="sr-only">
          Appuyez sur Entrée pour rechercher ou Échap pour effacer
        </div>
        
        {inputValue && (
          <button
            type="button"
            onClick={handleClearClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 transition-colors disabled:opacity-50"
            aria-label="Effacer la recherche"
            disabled={disabled}
          >
            ×
          </button>
        )}
      </div>
    </form>
  );
}