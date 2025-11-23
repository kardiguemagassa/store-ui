import apiClient from '../../../shared/api/apiClient';
import { 
  handleApiError, 
  getErrorMessage,
  logger 
} from '../../../shared/types/errors.types';
import type { ActionFunctionArgs } from "react-router-dom";
import type { 
  ContactMessage, 
  BackendContactMessage, 
  ContactData, 
  ContactSubmitResult,
  MessageFilters,
  ContactActionData 
} from '../types/contactService.types';
import type { ContactInfoData } from '../types/contact.types';

function mapBackendToFrontend(backendData: BackendContactMessage): ContactMessage {
  logger.debug('Mapping backend data', 'contactService', { backendData });
  
  const mappedData: ContactMessage = {
    contactId: backendData.contact_id || backendData.contactId,
    name: backendData.name,
    email: backendData.email,
    mobileNumber: backendData.mobile_number || backendData.mobileNumber || '',
    message: backendData.message,
    status: backendData.status,
    createdAt: backendData.created_at || backendData.createdAt,
    createdBy: backendData.created_by || backendData.createdBy,
    updatedAt: backendData.updated_at || backendData.updatedAt,
    updatedBy: backendData.updated_by || backendData.updatedBy
  };
  
  logger.debug('Data mapped to frontend', 'contactService', { mappedData });
  return mappedData;
}

function mapFrontendToBackend(frontendData: ContactData): Record<string, string> {
  logger.debug('Mapping frontend to backend', 'contactService', { frontendData });
  
  const backendData = {
    name: frontendData.name,
    email: frontendData.email,
    mobileNumber: frontendData.mobileNumber, 
    message: frontendData.message
  };
  
  logger.debug('Data mapped to backend', 'contactService', { backendData });
  return backendData;
}

// LOADER POUR LES INFORMATIONS DE CONTACT (DYNAMIQUE)
export async function contactInfoLoader(): Promise<ContactInfoData> {
  try {
    logger.info('Chargement des informations de contact', 'contactInfoLoader');
  
    const response = await apiClient.get<ContactInfoData>('/contacts');
    
    logger.info('Informations de contact chargées', 'contactInfoLoader', {
      dataReceived: !!response.data
    });
    
    return response.data;
    
  } catch (error: unknown) {
    logger.error('Échec du chargement des informations de contact', 'contactInfoLoader', error);
    
    // FALLBACK AVEC LES VRAIES VALEURS DE VOTRE application.yml
    const fallbackInfo: ContactInfoData = {
      phone: '+652185505',
      email: 'dev_magassakara@gmail.com',
      address: '8 Av de la fontaine rene 95160 Montmorency'
    };
    
    logger.info('Utilisation des informations de contact de fallback', 'contactInfoLoader', { fallbackInfo });
    return fallbackInfo;
  }
}

// CONTACTS PUBLIC
export async function submitContact(contactData: ContactData): Promise<ContactSubmitResult> {
  try {
    logger.info('Soumission du formulaire de contact', 'submitContact', {
      name: contactData.name,
      email: contactData.email,
      mobileNumber: contactData.mobileNumber 
    });

    const backendData = mapFrontendToBackend(contactData);
    
    const response = await apiClient.post<BackendContactMessage>('/contacts', backendData);

    logger.info('Formulaire de contact soumis avec succès', 'submitContact', {
      contactId: response.data.contact_id
    });

    return {
      success: true,
      contactId: response.data.contact_id
    };

  } catch (error: unknown) {
    logger.error('Erreur lors de la soumission du formulaire de contact', 'submitContact', error);
    
    const errorInfo = handleApiError(error);
    
    return {
      success: false,
      error: errorInfo.message,
      validationErrors: errorInfo.errors
    };
  }
}

// MESSAGES ADMIN
export async function getMessages(filters?: MessageFilters): Promise<ContactMessage[]> {
  try {
    logger.info('Récupération des messages admin', 'getMessages', { filters });

    const params: Record<string, string> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.onlyOpen !== undefined) {
      params.onlyOpen = filters.onlyOpen.toString();
    }

    const response = await apiClient.get<unknown>(
      '/admin/messages',
      { params }
    );

    logger.debug('Réponse API complète reçue', 'getMessages', { responseData: response.data });

    let messagesData = response.data;
    
    if (messagesData && typeof messagesData === 'object' && 'data' in messagesData) {
      messagesData = messagesData.data;
    }

    logger.debug('Structure des données messages', 'getMessages', { messagesData });
    
    if (Array.isArray(messagesData) && messagesData.length > 0) {
      logger.debug('Premier message analysé', 'getMessages', {
        firstMessage: messagesData[0],
        availableKeys: Object.keys(messagesData[0]),
        mobileNumber: messagesData[0].mobileNumber || messagesData[0].mobile_number
      });
    }

    if (!Array.isArray(messagesData)) {
      logger.error('Format de réponse invalide', 'getMessages', {
        receivedType: typeof messagesData,
        receivedData: messagesData
      });
      throw new Error('Format de réponse invalide');
    }

    // Transformation des données
    const frontendMessages = messagesData.map(mapBackendToFrontend);
    
    logger.info('Messages mappés avec succès', 'getMessages', {
      totalMessages: frontendMessages.length,
      firstMessage: frontendMessages[0]
    });

    return frontendMessages;

  } catch (error: unknown) {
    logger.error('Erreur lors de la récupération des messages', 'getMessages', error);
    throw error;
  }
}

export async function closeMessage(contactId: number): Promise<void> {
  try {
    logger.info(`Fermeture du message ${contactId}`, 'closeMessage');
    await apiClient.patch(`/admin/messages/${contactId}/close`);
    logger.info(`Message ${contactId} fermé avec succès`, 'closeMessage');
  } catch (error: unknown) {
    logger.error(`Erreur lors de la fermeture du message ${contactId}`, 'closeMessage', error);
    throw error;
  }
}

export async function reopenMessage(contactId: number): Promise<void> {
  try {
    logger.info(`Réouverture du message ${contactId}`, 'reopenMessage');
    
    await apiClient.patch(`/admin/messages/${contactId}/reopen`);
    logger.info(`Message ${contactId} rouvert avec succès`, 'reopenMessage');
  } catch (error: unknown) {
    logger.error(`Erreur lors de la réouverture du message ${contactId}`, 'reopenMessage', error);
    throw error;
  }
}

export async function deleteMessage(contactId: number): Promise<void> {
  try {
    logger.info(`Suppression du message ${contactId}`, 'deleteMessage');
   
    await apiClient.delete(`/admin/messages/${contactId}`);
    logger.info(`Message ${contactId} supprimé avec succès`, 'deleteMessage');
  } catch (error: unknown) {
    logger.error(`Erreur lors de la suppression du message ${contactId}`, 'deleteMessage', error);
    throw error;
  }
}

// ACTIONS POUR REACT ROUTER (CORRIGÉ)
export async function contactAction({ request }: ActionFunctionArgs): Promise<ContactActionData> {
  try {
    const formData = await request.formData();
    
    logger.debug('Données du formulaire reçues', 'contactAction', {
      formDataEntries: Array.from(formData.entries())
    });

    const contactData: ContactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      mobileNumber: formData.get('mobileNumber') as string,
      message: formData.get('message') as string,
    };

    logger.debug('Données de contact parsées', 'contactAction', { contactData });

    const result = await submitContact(contactData);
    
    if (result.success) {
      logger.info('Action de contact réussie', 'contactAction', { contactId: result.contactId });
      return { success: true };
    } else {
      logger.warn('Action de contact échouée', 'contactAction', {
        error: result.error,
        validationErrors: result.validationErrors
      });
      return {
        success: false,
        error: result.error,
        validationErrors: result.validationErrors
      };
    }

  } catch (error: unknown) {
    logger.error('Erreur lors de l\'action de contact', 'contactAction', error);
    
    const errorInfo = handleApiError(error);
    
    return {
      success: false,
      error: errorInfo.message,
      validationErrors: errorInfo.errors
    };
  }
}

// LOADERS POUR REACT ROUTER
export async function messagesLoader(): Promise<ContactMessage[]> {
  try {
    logger.info('Chargement des messages admin', 'messagesLoader');
    
    const messages = await getMessages({ onlyOpen: true });
    
    logger.info('Messages admin chargés avec succès', 'messagesLoader', {
      count: messages.length
    });
    
    return messages;
    
  } catch (error: unknown) {
    logger.error('Échec du chargement des messages admin', 'messagesLoader', error);
    const errorMessage = getErrorMessage(error);
    throw new Response(errorMessage, { status: 500 });
  }
}

export async function contactsLoader(): Promise<ContactMessage[]> {
  try {
    logger.info('Chargement de tous les contacts', 'contactsLoader');
    
    const contacts = await getMessages();
    
    logger.info('Contacts chargés avec succès', 'contactsLoader', {
      count: contacts.length
    });
    
    return contacts;
    
  } catch (error: unknown) {
    logger.error('Échec du chargement des contacts', 'contactsLoader', error);
    const errorMessage = getErrorMessage(error);
    throw new Response(errorMessage, { status: 500 });
  }
}

// SERVICE EXPORT
const contactService = {
  // Public
  submitContact,
  
  // Admin - Messages
  getMessages,
  closeMessage,
  reopenMessage,
  deleteMessage,
  
  // React Router Actions & Loaders
  contactAction,
  messagesLoader,
  contactsLoader,
  contactInfoLoader,
};

export default contactService;