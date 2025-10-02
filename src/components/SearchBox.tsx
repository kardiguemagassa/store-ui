// 📝 Interface TypeScript : définit le contrat des props
interface SearchBoxProps {
  label: string;           // Texte du label
  placeholder: string;     // Texte d'aide dans l'input
  value: string;          // Valeur actuelle de l'input
  handleSearch: (value: string) => void; // Fonction callback
}

// 🔍 Composant SearchBox : champ de recherche réutilisable
// Props destructurées directement dans les paramètres pour plus de clarté
export default function SearchBox({
  label,        // Texte du label affiché à côté de l'input
  placeholder,  // Texte d'aide dans l'input vide
  value,        // Valeur contrôlée par le parent (controlled component)
  handleSearch, // Fonction callback pour remonter les changements au parent
}: SearchBoxProps) {
  return (
    // Container flex : aligne label et input horizontalement
    // flex-1 : prend tout l'espace disponible dans son conteneur parent
    <div className="flex items-center gap-3 pl-4 flex-1 font-primary">
      
      {/* Label : adapte sa couleur au thème (dark/light) */}
      <label className="text-lg font-semibold text-primary dark:text-light">
        {label}
      </label>
      
      {/* Input contrôlé : la valeur est gérée par le state du parent */}
      <input
        type="text"
        className="px-4 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter"
        placeholder={placeholder}
        
        /* value : synchronisé avec le state du parent (one-way data binding) */
        value={value}
        
        /* onChange : déclenche handleSearch à chaque frappe */
        /* event.target.value : récupère la nouvelle valeur de l'input */
        /* Remonte la valeur au parent qui met à jour son state */
        onChange={(event) => handleSearch(event.target.value)}
      />
    </div>
  );
}