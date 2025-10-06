// Interface : définit les props du composant dropdown
interface DropdownProps {
  label: string;                      // Texte du label
  options: string[];                  // Liste des options disponibles
  selectedValue: string;              // Option actuellement sélectionnée
  handleSort: (value: string) => void; // Callback pour remonter la sélection au parent
}

// Composant Dropdown : menu déroulant réutilisable pour le tri
export default function Dropdown({
  label,
  options,
  selectedValue,
  handleSort,
}: DropdownProps) {
  return (
    // Container : alignement à droite avec justify-end
    <div className="flex items-center gap-2 justify-end pr-12 flex-1 font-primary">
      
      {/* Label du dropdown */}
      <label className="text-lg font-semibold text-primary dark:text-light">
        {label}
      </label>
      
      {/* Select contrôlé : la valeur est gérée par le state du parent */}
      <select
        className="px-3 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter"
        value={selectedValue} // Synchronisé avec le state du parent
        onChange={(event) => handleSort(event.target.value)} // Remonte la nouvelle valeur
      >
        {/* Génère une option pour chaque élément du tableau */}
        {/* key={index} : identifiant unique pour React (acceptable ici car la liste est statique) */}
        {options.map((optionVal, index) => (
          <option key={index} value={optionVal}>
            {optionVal}
          </option>
        ))}
      </select>
    </div>
  );
}