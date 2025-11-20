import type { ContactInfoData } from "../../types/contact.types";

interface ContactInfoProps {
  contactInfo: ContactInfoData;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ contactInfo }) => {
  return (
    <div className="text-primary dark:text-light p-6">
      <h2 className="text-2xl font-semibold mb-4">Coordonnées</h2>
      <p className="mb-4">
        <strong>Téléphone:</strong> {contactInfo.phone}
      </p>
      <p className="mb-4">
        <strong>Email:</strong> {contactInfo.email}
      </p>
      <p className="mb-4">
        <strong>Adresse:</strong> {contactInfo.address}
      </p>
    </div>
  );
};

export default ContactInfo;