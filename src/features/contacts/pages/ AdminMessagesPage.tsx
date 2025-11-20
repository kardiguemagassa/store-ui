import React from 'react';
import { toast } from 'react-toastify';
import PageTitle from '../../../shared/components/PageTitle';
import MessagesTable from '../components/MessagesTable/MessagesTable';
import { useMessages } from '../hooks/useMessages';
import { getErrorMessage } from '../../../shared/types/errors.types';

export const AdminMessagesPage: React.FC = () => {
  const { messages, isLoading, error, handleCloseMessage } = useMessages();

  const handleClose = async (contactId: number) => {
    try {
      await handleCloseMessage(contactId);
      toast.success("Message fermé avec succès");
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      toast.error(errorMsg);
    }
  };

  if (error) {
    return (
      <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
        <div className="text-center text-red-500 text-xl">
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[852px] container mx-auto px-6 py-12 font-primary dark:bg-darkbg">
      {messages.length === 0 ? (
        <p className="text-center text-2xl text-primary dark:text-lighter">
          Aucun message ouvert trouvé.
        </p>
      ) : (
        <>
          <PageTitle title="Messages de Contact - Admin" />
          <MessagesTable
            messages={messages}
            onCloseMessage={handleClose}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default AdminMessagesPage;