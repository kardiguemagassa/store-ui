import apiClient from "../api/apiClient";
import type { ContactMessage } from "../types/ContactMessage";
import { handleError } from "../types/errors";



export async function messagesLoader() {
  try {
    console.log("🔄 [MESSAGES LOADER] Fetching admin messages...");
    
    // ✅ Ajoutez le typage ContactMessage[]
    const response = await apiClient.get<ContactMessage[]>("/admin/messages");
    
    console.log("✅ [MESSAGES LOADER] Response received");
    console.log("📊 [MESSAGES LOADER] Data type:", typeof response.data);
    console.log("📦 [MESSAGES LOADER] Is array?", Array.isArray(response.data));
    console.log("🔢 [MESSAGES LOADER] Number of messages:", response.data?.length);
    
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      console.log("🎯 [MESSAGES LOADER] First message sample:", response.data[0]);
    } else {
      console.log("ℹ️ [MESSAGES LOADER] No messages found or empty array");
    }
    
    return response.data || [];
    
  } catch (error: unknown) {
    console.error("❌ [MESSAGES LOADER] Failed to fetch messages:", error);
    const errorMessage = handleError(error);

    let status = 500;
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      status = axiosError.response?.status || 500;
    }
    
    throw new Response(errorMessage, { status });
  }
}