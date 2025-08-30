import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

interface User {
  phoneNumber: string;
  name: string;
  email?: string;
  addresses?: any[];
  orders?: any[];
  cart?: any[];
  wishlist?: any[];
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, otp?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  syncUserDataAcrossDevices: () => Promise<void>;
  loadUserData: (user: User) => void;
  autoLogin: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phoneNumber: string, otp?: string) => {
        set({ isLoading: true });
        try {
          const response = await api.login(phoneNumber, otp || '');
          
          if (response.success && response.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            
            localStorage.setItem('userPhone', phoneNumber);
            localStorage.setItem('isLoggedIn', 'true');
            
            return true;
          }
          
          set({ isLoading: false });
          return false;
        } catch (error) {
          set({ isLoading: false });
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('userPhone');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const result = await api.updateUserProfile(data.name || '', data.email || '');
          if (result) {
            set(state => ({
              user: state.user ? { ...state.user, ...data } : null
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating profile:', error);
          return false;
        }
      },

      refreshUserData: async () => {
        const state = get();
        if (!state.user || !state.isAuthenticated) return;

        try {
          const userData = await api.getUserProfile(state.user.phoneNumber);
          if (userData && userData.user) {
            set({ user: userData.user });
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      },

      syncUserDataAcrossDevices: async () => {
        const state = get();
        if (!state.user || !state.isAuthenticated) return;

        try {
          const userData = await api.getUserProfile(state.user.phoneNumber);
          if (userData && userData.user) {
            set({ user: userData.user });
            localStorage.setItem('userData', JSON.stringify(userData.user));
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      },

      loadUserData: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      autoLogin: async () => {
        if (typeof window === 'undefined') return false;
        
        const phoneNumber = localStorage.getItem('userPhone');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (phoneNumber && isLoggedIn === 'true') {
          try {
            const userData = await api.getUserProfile(phoneNumber);
            if (userData && userData.user) {
              set({ 
                user: userData.user, 
                isAuthenticated: true 
              });
              
              // Load user's cart, wishlist, and orders
              await get().syncUserDataAcrossDevices();
              return true;
            }
          } catch (error) {
            console.error('Auto-login failed:', error);
            localStorage.removeItem('userPhone');
            localStorage.removeItem('isLoggedIn');
          }
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.getState().autoLogin();
}
