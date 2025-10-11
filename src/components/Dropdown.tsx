interface DropdownProps {
  label: string;                      
  options: string[];                  
  selectedValue: string;              
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
    
    <div className="flex items-center gap-2 justify-end pr-12 flex-1 font-primary">
      
      {/* Label du dropdown */}
      <label className="text-lg font-semibold text-primary dark:text-light">
        {label}
      </label>
      
      <select
        className="px-3 py-2 text-base border rounded-md transition border-primary dark:border-light focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none text-gray-800 dark:text-lighter"
        value={selectedValue} 
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