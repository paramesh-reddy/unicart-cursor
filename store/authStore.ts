import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import { apiClient } from "@/lib/api-client";
import { apiurl } from "@/store/constants";
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
// Actions
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  checkAuth: () => void;
}
  
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // Call the working login API using apiClient
          const data = await apiClient.post(`${apiurl}api/auth/login`, { email, password });
          
          if (data.success) {
            // Store token and user data
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            
            // Update state
            set({ 
              user: data.user, 
              isAuthenticated: true,
              isLoading: false
            });
            
            return { success: true, message: "Login successful" };
          } else {
            set({ isLoading: false });
            return { success: false, message: data.error || "Login failed" };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, message: error.message || "Network error. Please try again." };
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          const { email, password, firstName, lastName } = data;
          
          // Call the working register API using apiClient
          const result = await apiClient.post(`${apiurl}api/auth/register`, { email, password, firstName, lastName });
          
          if (result.success) {
            // Store token and user data
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user_data', JSON.stringify(result.user));
            
            // Update state
            set({ 
              user: result.user, 
              isAuthenticated: true,
              isLoading: false
            });
            
            return { success: true, message: "Registration successful" };
          } else {
            set({ isLoading: false });
            return { success: false, message: result.error || "Registration failed" };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, message: error.message || "Network error. Please try again." };
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: () => {
        if (typeof window === "undefined") return;
        
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            set({ user, isAuthenticated: true });
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        }
      },
    }),
    {
      name: "unicart_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

