import { useState } from "react";
import { useLoaderData, useRevalidator, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PageTitle from "../../../shared/components/PageTitle";
import UserTable from "../components/UserTable";
import RoleModal from "../components/RoleModal";
import { promoteUser, assignRole, removeRole } from "../services/userService";
import { getErrorMessage, logger } from "../../../shared/types/errors.types";
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

  // Log du chargement initial
  logger.debug("Chargement page utilisateurs", "Users", {
    currentPage,
    usersCount: users.length,
    totalPages
  });

  // Gestion du changement de page
  const handlePageChange = (newPage: number) => {
    logger.info("Changement de page utilisateurs", "Users", {
      fromPage: currentPage,
      toPage: newPage
    });

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
      logger.info("Promotion utilisateur", "Users", { userId });
      
      const message = await promoteUser(userId);
      toast.success(message);
      
      logger.info("Promotion réussie", "Users", { userId });
      revalidator.revalidate();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      logger.error("Échec promotion utilisateur", "Users", error, { userId });
      toast.error(errorMessage);
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
      logger.info("Assignation rôle", "Users", { userId, roleType });
      
      await assignRole(userId, roleType);
      toast.success(`Rôle ${ROLE_DISPLAY_NAMES[roleType]} attribué avec succès`);
      
      logger.info("Assignation rôle réussie", "Users", { userId, roleType });
      setShowRoleModal(false);
      revalidator.revalidate();
    } catch (error: unknown) {
      logger.error("Échec assignation rôle", "Users", error, { userId, roleType });
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
      logger.warn("Tentative retrait rôle USER bloquée", "Users", { userId });
      toast.error("Impossible de retirer le rôle USER");
      return;
    }

    if (!window.confirm(`Confirmer le retrait du rôle ${ROLE_DISPLAY_NAMES[roleType]} ?`)) {
      logger.debug("Retrait rôle annulé par l'utilisateur", "Users", { userId, roleType });
      return;
    }

    setIsLoading(true);
    try {
      logger.info("Retrait rôle", "Users", { userId, roleType });
      
      await removeRole(userId, roleType);
      toast.success(`Rôle ${ROLE_DISPLAY_NAMES[roleType]} retiré avec succès`);
      
      logger.info("Retrait rôle réussi", "Users", { userId, roleType });
      revalidator.revalidate();
    } catch (error: unknown) {
      logger.error("Échec retrait rôle", "Users", error, { userId, roleType });
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const openRoleModal = (user: CustomerWithRoles) => {
    logger.debug("Ouverture modal rôle", "Users", { 
      userId: user.customerId,
      userName: user.name 
    });
    
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    logger.debug("Fermeture modal rôle", "Users");
    setShowRoleModal(false);
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
          onClose={closeRoleModal}
        />
      )}
    </div>
  );
}