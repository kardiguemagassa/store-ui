import { ROLE_DISPLAY_NAMES, ROLE_COLORS, ROLES } from '../types/users.types';

interface RoleBadgeProps {
  role: string;
  onRemove?: () => void;
  isLoading?: boolean;
}

export default function RoleBadge({ role, onRemove, isLoading }: RoleBadgeProps) {
  const canRemove = role !== ROLES.USER && onRemove;

  return (
    <div className="flex items-center gap-1">
      <span
        className={`${ROLE_COLORS[role] || "bg-gray-500"} text-white text-xs px-2 py-1 rounded-full`}
      >
        {ROLE_DISPLAY_NAMES[role] || role}
      </span>
      {canRemove && (
        <button
          onClick={onRemove}
          disabled={isLoading}
          className="text-red-500 hover:text-red-700 text-xs font-bold disabled:opacity-50"
          title="Retirer ce rôle"
        >
          ✕
        </button>
      )}
    </div>
  );
}