import type { ContactMessage } from "../../types/contactService.types";

interface MessagesTableProps {
  messages: ContactMessage[];
  onCloseMessage: (contactId: number) => void;
  isLoading?: boolean;
}

export const MessagesTable: React.FC<MessagesTableProps> = ({
  messages,
  onCloseMessage,
  isLoading = false
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full mt-4 table-fixed border-collapse border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-primary dark:bg-light text-lighter dark:text-primary">
            <th className="w-1/6 border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
              Nom
            </th>
            <th className="w-1/6 border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
              Email
            </th>
            <th className="w-1/6 border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
              Mobile 
            </th>
            <th className="w-2/5 border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
              Message
            </th>
            <th className="w-1/6 border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr
              key={message.contactId}
              className="bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-lighter"
            >
              <td className="border px-4 py-2 break-words">
                {message.name}
              </td>
              <td className="border px-4 py-2 break-words">
                {message.email}
              </td>
              <td className="border px-4 py-2 break-words">
                {message.mobileNumber || "N/A"}
              </td>
              <td className="border px-4 py-2 break-words max-w-[300px] overflow-auto">
                {message.message}
              </td>
              <td className="border px-4 py-2 text-center">
                <button
                  onClick={() => message.contactId && onCloseMessage(message.contactId)}
                  disabled={isLoading}
                  className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition disabled:opacity-50"
                >
                  {isLoading ? "Fermeture..." : "Fermer"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessagesTable;