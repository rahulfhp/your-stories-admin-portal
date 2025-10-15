import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useThemeStore } from './theme';
import { authService } from '@/services/authService';

interface Admin {
  _id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (admin: Admin, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      isAuthenticated: false,
      login: (admin, accessToken) => {
        // Set light mode when user logs in
        useThemeStore.getState().setTheme('light');
        
        set({ 
          admin, 
          accessToken, 
          isAuthenticated: true 
        });
      },
      logout: async () => {
        try {
          // Call the logout API
          await authService.logout();
          
          // Clear auth state
          set({ 
            admin: null, 
            accessToken: null, 
            isAuthenticated: false 
          });
        } catch (error) {
          console.error('Logout failed:', error);
          // Still clear auth state even if API call fails
          set({ 
            admin: null, 
            accessToken: null, 
            isAuthenticated: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);