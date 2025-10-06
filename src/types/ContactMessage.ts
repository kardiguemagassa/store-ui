export interface ContactMessage {
  contactId: number;
  name: string;
  email: string;
  mobileNumber?: string;
  message: string;
  status?: string;
  createdAt?: string;
}