import type { SortOption } from "../types/product.types";

interface DropdownProps {
  label: string;
  options: SortOption[];
  selectedValue: SortOption;
  handleSort: (value: SortOption) => void;
  disabled?: boolean; 
}

// Composant Dropdown avec support disabled
export default function Dropdown({
  label,
  options,
  selectedValue,
  handleSort,
  disabled = false 
}: DropdownProps) {
  return (
    <div className="flex items-center gap-2 justify-end pr-12 flex-1 font-primary">
      {/* Label du dropdown */}
      <label className={`
        text-lg font-semibold 
        ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-primary dark:text-light'}
      `}>
        {label}
      </label>
      
      <select
        className={`
          px-3 py-2 text-base border rounded-md transition 
          focus:ring focus:ring-dark dark:focus:ring-lighter focus:outline-none 
          text-gray-800 dark:text-lighter
          ${disabled 
            ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700' 
            : 'border-primary dark:border-light bg-white dark:bg-gray-800 cursor-pointer'
          }
        `} 
        value={selectedValue}
        onChange={(event) => !disabled && handleSort(event.target.value as SortOption)} // Empêcher les changements si disabled
        disabled={disabled} // Attribut HTML disabled
      >
        {/* Génère une option pour chaque élément du tableau */}
        {options.map((optionVal) => (
          <option key={optionVal} value={optionVal}>
            {optionVal}
          </option>
        ))}
      </select>
    </div>
  );
}