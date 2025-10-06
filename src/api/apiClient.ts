/*import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  withCredentials: true, // attacher les cookies aux navigateur
});

// for profile
// npm install --save-dev @types/js-cookie typeScript
apiClient.interceptors.request.use(
  async (config) => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    
    // Only fetch CSRF token for non-safe methods
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    const method = config.method?.toUpperCase() || "GET"; 
    
    if (!safeMethods.includes(method)) {
      let csrfToken = Cookies.get("XSRF-TOKEN");
      if (!csrfToken) {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/csrf-token`, {
          withCredentials: true,
        });
        csrfToken = Cookies.get("XSRF-TOKEN");
        if (!csrfToken) {
          throw new Error("Failed to retrieve CSRF token from cookies");
        }
      }
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;*/

import axios from "axios";
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const jwtToken = localStorage.getItem("jwtToken");
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    const method = config.method?.toUpperCase() || "GET"; 
    
    if (!safeMethods.includes(method)) {
      let csrfToken = Cookies.get("XSRF-TOKEN");
      if (!csrfToken) {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/csrf-token`, {
          withCredentials: true,
        });
        csrfToken = Cookies.get("XSRF-TOKEN");
        if (!csrfToken) {
          throw new Error("Failed to retrieve CSRF token from cookies");
        }
      }
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const jwtToken = localStorage.getItem("jwtToken");
      
      if (jwtToken) {
        console.warn("JWT token expired or invalid. Redirecting to login...");
        
        // Nettoyage du stockage local
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        
        // Redirection vers login avec un paramètre pour afficher un message
        window.location.href = "/login?session=expired";
      }
    }
    
    // Gestion d'autres erreurs courantes
    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }
    
    if (error.response?.status === 500) {
      console.error("Internal server error");
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;