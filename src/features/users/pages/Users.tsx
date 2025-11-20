import { useState } from "react";
import { useLoaderData, useRevalidator, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageTitle from "../../../shared/components/PageTitle";
import UserTable from "../components/UserTable";

import RoleModal from "../components/RoleModal";
import { promoteUser, assignRole, removeRole } from "../services/userService";
import { getErrorMessage } from "../../../shared/types/errors.types";
import { ROLES, ROLE_DISPLAY_NAMES } from "../types/users.types";
import type { 
  CustomerWithRoles, 
  PaginatedUsersResponse,
  RoleType 
} from "../types/users.types";
import Pagination from "../../../shared/components/Pagination";

export default function Users() {
  const loaderData = useLoaderData() as PaginatedUsersResponse;
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams(); 

  const [selectedUser, setSelectedUser] = useState<CustomerWithRoles | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupération de la page actuelle depuis l'URL (avec fallback)
  const currentPage = parseInt(searchParams.get('page') || '0');
  const users: CustomerWithRoles[] = loaderData?.content || [];
  const totalPages = loaderData?.totalPages || 0;

  // Gestion du changement de page
  const handlePageChange = (newPage: number) => {
    // Mettre à jour les paramètres d'URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    setSearchParams(newSearchParams);
    
    // Revalider les données pour cette page
    revalidator.revalidate();
  };

  const handlePromote = async (userId: number): Promise<void> => {
    setIsLoading(true);
    try {
      const message = await promoteUser(userId);
      toast.success(message);
      revalidator.revalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async (
    userId: number, 
    roleType: RoleType
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await assignRole(userId, roleType);
      toast.success(`Rôle ${ROLE_DISPLAY_NAMES[roleType]} attribué avec succès`);
      setShowRoleModal(false);
      revalidator.revalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (
    userId: number, 
    roleType: RoleType
  ): Promise<void> => {
    if (roleType === ROLES.USER) {
      toast.error("Impossible de retirer le rôle USER");
      return;
    }

    if (!window.confirm(`Confirmer le retrait du rôle ${ROLE_DISPLAY_NAMES[roleType]} ?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await removeRole(userId, roleType);
      toast.success(`Rôle ${ROLE_DISPLAY_NAMES[roleType]} retiré avec succès`);
      revalidator.revalidate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const openRoleModal = (user: CustomerWithRoles) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  return (
    <div className="min-h-screen container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      <PageTitle title="Gestion des Utilisateurs" />

      {/* UserTable avec les données */}
      <UserTable
        users={users}
        isLoading={isLoading}
        onPromote={handlePromote}
        onRemoveRole={handleRemoveRole}
        onOpenRoleModal={openRoleModal}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {showRoleModal && selectedUser && (
        <RoleModal
          user={selectedUser}
          isLoading={isLoading}
          onAssignRole={handleAssignRole}
          onClose={() => setShowRoleModal(false)}
        />
      )}
    </div>
  );
}