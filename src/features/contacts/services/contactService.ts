import apiClient from '../../../shared/api/apiClient';
import { 
  handleApiError, 
  getErrorMessage 
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
  console.log('Mapping backend data:', backendData);
  
  const mappedData: ContactMessage = {
    contactId: backendData.contact_id || backendData.contactId,
    name: backendData.name,
    email: backendData.email,
    mobileNumber: backendData.mobile_number || backendData.mobileNumber || '', // Fallback pour eviter "N/A"
    message: backendData.message,
    status: backendData.status,
    createdAt: backendData.created_at || backendData.createdAt,
    createdBy: backendData.created_by || backendData.createdBy,
    updatedAt: backendData.updated_at || backendData.updatedAt,
    updatedBy: backendData.updated_by || backendData.updatedBy
  };
  
  console.log('Mapped to frontend:', mappedData);
  return mappedData;
}


function mapFrontendToBackend(frontendData: ContactData): Record<string, string> {
  console.log('Mapping frontend to backend - Input:', frontendData);
  
  const backendData = {
    name: frontendData.name,
    email: frontendData.email,
    mobileNumber: frontendData.mobileNumber, 
    message: frontendData.message
  };
  
  console.log('Mapping frontend to backend - Output:', backendData);
  return backendData;
}

// LOADER POUR LES INFORMATIONS DE CONTACT (DYNAMIQUE)
export async function contactInfoLoader(): Promise<ContactInfoData> {
  try {
    console.log('[CONTACT INFO LOADER] Fetching contact information from backend...');
  
    const response = await apiClient.get<ContactInfoData>('/contacts');
    
    console.log('[CONTACT INFO LOADER] Contact info loaded from backend:', response.data);
    
    return response.data;
    
  } catch (error: unknown) {
    console.error('[CONTACT INFO LOADER] Failed to fetch contact info:', error);
    
    // FALLBACK AVEC LES VRAIES VALEURS DE VOTRE application.yml
    const fallbackInfo: ContactInfoData = {
      phone: '+652185505',
      email: 'dev_magassakara@gmail.com',
      address: '8 Av de la fontaine rene 95160 Montmorency'
    };
    
    console.log('[CONTACT INFO LOADER] Using fallback contact info:', fallbackInfo);
    return fallbackInfo;
  }
}


// CONTACTS PUBLIC
export async function submitContact(contactData: ContactData): Promise<ContactSubmitResult> {
  try {
    console.log('Submitting contact form:', {
      name: contactData.name,
      email: contactData.email,
      mobileNumber: contactData.mobileNumber 
    });

    const backendData = mapFrontendToBackend(contactData);
    
    const response = await apiClient.post<BackendContactMessage>('/contacts',backendData);

    console.log(' Contact form submitted:', response.data);

    return {
      success: true,
      contactId: response.data.contact_id
    };

  } catch (error: unknown) {
    console.error('Error submitting contact form:', error);
    
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
    console.log('Fetching admin messages...');

    const params: Record<string, string> = {};

    if (filters?.status) params.status = filters.status;
    if (filters?.onlyOpen !== undefined) {
      params.onlyOpen = filters.onlyOpen.toString();
    }

    const response = await apiClient.get<unknown>(
      '/admin/messages',
      { params }
    );

    console.log('Full API response:', response.data);

    let messagesData = response.data;
    
    if (messagesData && typeof messagesData === 'object' && 'data' in messagesData) {
      messagesData = messagesData.data;
    }

    console.log(' Messages data structure:', messagesData);
    
    if (Array.isArray(messagesData) && messagesData.length > 0) {
      console.log(' First message object:', messagesData[0]);
      console.log(' Available keys in message:', Object.keys(messagesData[0]));
      console.log(' Mobile number in first message:', messagesData[0].mobileNumber, messagesData[0].mobile_number);
    }

    if (!Array.isArray(messagesData)) {
      console.error('Expected array but got:', typeof messagesData, messagesData);
      throw new Error('Format de réponse invalide');
    }

    // Transformation des données
    const frontendMessages = messagesData.map(mapBackendToFrontend);
    
    console.log('Messages after mapping:', frontendMessages);
    console.log('First message after mapping:', frontendMessages[0]);

    return frontendMessages;

  } catch (error: unknown) {
    console.error(' Error fetching messages:', error);
    throw error;
  }
}

export async function closeMessage(contactId: number): Promise<void> {
  try {
    console.log(`Closing message ${contactId}`);
    await apiClient.patch(`/admin/messages/${contactId}/close`);
    console.log('Message closed');
  } catch (error: unknown) {
    console.error(`Error closing message ${contactId}:`, error);
    throw error;
  }
}

export async function reopenMessage(contactId: number): Promise<void> {
  try {
    console.log(`Reopening message ${contactId}`);
    
    await apiClient.patch(`/admin/messages/${contactId}/reopen`);
    console.log('Message reopened');
  } catch (error: unknown) {
    console.error(`Error reopening message ${contactId}:`, error);
    throw error;
  }
}

export async function deleteMessage(contactId: number): Promise<void> {
  try {
    console.log(`Deleting message ${contactId}`);
   
    await apiClient.delete(`/admin/messages/${contactId}`);
    console.log('Message deleted');
  } catch (error: unknown) {
    console.error(`Error deleting message ${contactId}:`, error);
    throw error;
  }
}


// ACTIONS POUR REACT ROUTER (CORRIGÉ)
export async function contactAction({ request }: ActionFunctionArgs): Promise<ContactActionData> {
  try {
    const formData = await request.formData();
    console.log(' FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    const contactData: ContactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      mobileNumber: formData.get('mobileNumber') as string,
      message: formData.get('message') as string,
    };

    console.log('Parsed contact data:', contactData);

    const result = await submitContact(contactData);
    
    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error,
        validationErrors: result.validationErrors
      };
    }

  } catch (error: unknown) {
    console.error('Contact action error:', error);
    
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
    console.log('[MESSAGES LOADER] Fetching admin messages...');
    
    const messages = await getMessages({ onlyOpen: true });
    
    console.log('[MESSAGES LOADER] Messages loaded:', messages.length);
    
    return messages;
    
  } catch (error: unknown) {
    console.error('[MESSAGES LOADER] Failed to fetch messages:', error);
    const errorMessage = getErrorMessage(error);
    throw new Response(errorMessage, { status: 500 });
  }
}

export async function contactsLoader(): Promise<ContactMessage[]> {
  try {
    console.log('[CONTACTS LOADER] Fetching all contacts...');
    
    const contacts = await getMessages();
    
    console.log('[CONTACTS LOADER] Contacts loaded:', contacts.length);
    
    return contacts;
    
  } catch (error: unknown) {
    console.error('[CONTACTS LOADER] Failed to fetch contacts:', error);
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
  contactInfoLoader, // LOADER DYNAMIQUE
};

export default contactService;