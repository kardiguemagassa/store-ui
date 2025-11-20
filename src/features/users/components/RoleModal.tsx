import { ROLE_DISPLAY_NAMES, ROLE_COLORS, type RoleType } from '../types/users.types';
import type { CustomerWithRoles } from '../types/users.types';
import { getAvailableRoles } from '../services/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faUserPlus, 
  faCrown, 
  faUserTie, 
  faUserShield, 
  faCheck,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface RoleModalProps {
  user: CustomerWithRoles;
  isLoading: boolean;
  onAssignRole: (userId: number, roleType: RoleType) => void;
  onClose: () => void;
}

// Icônes pour chaque rôle avec gestion complète des types
const ROLE_ICONS: Record<string, IconDefinition> = {
  ROLE_USER: faUser,
  ROLE_EMPLOYEE: faUserTie,
  ROLE_MANAGER: faCrown,
  ROLE_ADMIN: faUserShield,
};

// Descriptions pour chaque rôle avec gestion complète des types
const ROLE_DESCRIPTIONS: Record<string, string> = {
  ROLE_USER: "Accès client basique aux fonctionnalités du site",
  ROLE_EMPLOYEE: "Accès aux fonctionnalités employé et gestion basique",
  ROLE_MANAGER: "Gestion des stocks, commandes et équipe employé",
  ROLE_ADMIN: "Accès complet à toutes les fonctionnalités administratives",
};

// Helper function pour obtenir l'icône d'un rôle de manière sécurisée
const getRoleIcon = (role: string): IconDefinition => {
  return ROLE_ICONS[role] || faUser;
};

// Helper function pour obtenir la description d'un rôle de manière sécurisée
const getRoleDescription = (role: string): string => {
  return ROLE_DESCRIPTIONS[role] || "Rôle utilisateur";
};

// Helper function pour obtenir la couleur d'un rôle de manière sécurisée
const getRoleColor = (role: string): string => {
  return ROLE_COLORS[role] || 'bg-gray-500';
};

export default function RoleModal({ 
  user, 
  isLoading, 
  onAssignRole, 
  onClose 
}: RoleModalProps) {
  const availableRoles = getAvailableRoles(user.roles);

  const handleRoleSelect = (role: RoleType) => {
    onAssignRole(user.customerId, role);
  };

  // Fonction pour obtenir la classe de couleur sécurisée
  const getColorClass = (_baseColor: string, role: string): string => {
    const colorMap: Record<string, string> = {
      'blue': 'border-blue-500 text-blue-500',
      'green': 'border-green-500 text-green-500',
      'yellow': 'border-yellow-500 text-yellow-500', 
      'red': 'border-red-500 text-red-500',
      'gray': 'border-gray-500 text-gray-500'
    };
    
    const colorName = getRoleColor(role).replace('bg-', '').replace('-500', '');
    return colorMap[colorName] || colorMap['gray'];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <FontAwesomeIcon 
                icon={faUserPlus} 
                className="w-5 h-5 text-blue-600 dark:text-blue-400" 
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Attribuer un rôle
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user.name} • {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            aria-label="Fermer"
          >
            <FontAwesomeIcon 
              icon={faXmark} 
              className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
            />
          </button>
        </div>

        {/* Current Roles */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            Rôles actuels
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${getRoleColor(role)} text-white shadow-sm`}
              >
                {ROLE_DISPLAY_NAMES[role] || role}
              </span>
            ))}
            {user.roles.length === 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                Aucun rôle spécifique
              </span>
            )}
          </div>
        </div>

        {/* Available Roles */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Rôles disponibles
          </h3>
          
          {availableRoles.length > 0 ? (
            <div className="space-y-3">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  disabled={isLoading}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all duration-200 group
                    ${isLoading 
                      ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed' 
                      : `
                        bg-white dark:bg-gray-800 
                        border-gray-200 dark:border-gray-700 
                        hover:shadow-lg 
                        hover:scale-[1.02]
                        active:scale-[0.98]
                        hover:${getColorClass('border', role).split(' ')[0]}
                      `
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRoleColor(role).replace('bg-', 'bg-').replace('-500', '-100')} dark:${getRoleColor(role).replace('bg-', 'bg-').replace('-500', '-900/30')}`}>
                        <FontAwesomeIcon 
                          icon={getRoleIcon(role)} 
                          className={`w-4 h-4 ${getRoleColor(role).replace('bg-', 'text-')}`} 
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                          {ROLE_DISPLAY_NAMES[role] || role}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getRoleDescription(role)}
                        </div>
                      </div>
                    </div>
                    {!isLoading && (
                      <div className={`w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:${getColorClass('border', role).split(' ')[0]} transition-colors`} />
                    )}
                    {isLoading && (
                      <div className={`w-6 h-6 border-2 border-gray-300 ${getRoleColor(role).replace('bg-', 'border-t-')} rounded-full animate-spin`} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faCheck} 
                  className="w-8 h-8 text-green-600 dark:text-green-400" 
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Tous les rôles attribués
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Cet utilisateur possède déjà tous les rôles disponibles.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}