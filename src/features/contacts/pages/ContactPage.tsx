import React from 'react';
import { useLoaderData } from 'react-router-dom';
import PageTitle from '../../../shared/components/PageTitle';
import ContactForm from '../components/ContactForm/ContactForm';
import ContactInfo from '../components/ContactInfo/ContactInfo';
import { useContactForm } from '../hooks/useContactForm';
import type { ContactInfoData } from '../types/contact.types';

export const ContactPage: React.FC = () => {
  const contactInfo = useLoaderData() as ContactInfoData;
  const { actionData, formRef, isSubmitting, handleSubmit } = useContactForm();

  return (
    <div className="max-w-[1152px] min-h-[852px] mx-auto px-6 py-8 font-primary bg-normalbg dark:bg-darkbg">
      <PageTitle title="Contactez-nous" />
      
      <p className="max-w-[768px] mx-auto mt-8 text-gray-600 dark:text-lighter mb-8 text-center">
        N'hésitez pas à nous contacter pour toute question, commentaire ou suggestion.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-[952px] mx-auto mt-8">
        <ContactInfo contactInfo={contactInfo} />
        <ContactForm
          actionData={actionData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          formRef={formRef}
        />
      </div>
    </div>
  );
};

export default ContactPage;