
'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { safeGet, safeSet } from '@/lib/storage'
import { useWishlist } from '@/lib/wishlistStore'
import { useCart } from '@/lib/cartStore'
import { useAddressBook } from '@/lib/addressStore'
import { useOrders } from '@/lib/ordersStore'
import { useAuthStore } from '@/lib/authStore'

interface CustomUser {
  id: string; // Phone number will be the ID
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the init functions from the stores
  const { init: initWishlist, clear: clearWishlist } = useWishlist();
  const { init: initCart, clear: clearCart } = useCart();
  const { init: initAddresses, clear: clearAddresses } = useAddressBook();
  const { init: initOrders, clear: clearOrders } = useOrders();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First try to auto-login with authStore
        const autoLoginSuccess = await useAuthStore.getState().autoLogin();
        
        if (autoLoginSuccess) {
          // If auto-login succeeded, get the user from authStore
          const authUser = useAuthStore.getState().user;
          if (authUser) {
            // Set user in this context
            const customUser: CustomUser = { id: authUser.phoneNumber };
            setUser(customUser);
            safeSet('custom-user', customUser);
            
            // Initialize stores for the logged-in user
            initWishlist(customUser.id);
            initCart(customUser.id);
            initAddresses(customUser.id);
            initOrders(customUser.id);
          }
        } else {
          // If auto-login failed, try the old method
          const storedUser = safeGet<CustomUser | null>('custom-user', null);
          if (storedUser) {
            setUser(storedUser);
            // Initialize stores for the logged-in user
            initWishlist(storedUser.id);
            initCart(storedUser.id);
            initAddresses(storedUser.id);
            initOrders(storedUser.id);
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Return cleanup function
    return () => {
      // Cleanup subscriptions if needed
    };
  }, [initWishlist, initCart, initAddresses, initOrders]);

  const login = async (phone: string) => {
    try {
      // Try to login with authStore first (this will handle API calls)
      const result = await useAuthStore.getState().login(phone);
      
      if (result.success) {
        // If login succeeded, get the user from authStore
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          // Set user in this context
          const newUser: CustomUser = { id: phone };
          safeSet('custom-user', newUser);
          setUser(newUser);
          
          // Initialize stores on new login
          initWishlist(newUser.id);
          initCart(newUser.id);
          initAddresses(newUser.id);
          initOrders(newUser.id);
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  const logout = async () => {
    try {
      // Logout from authStore first (this will handle API calls)
      await useAuthStore.getState().logout();
      
      // Clear local storage and state
      safeSet('custom-user', null); // Clear from storage
      setUser(null);
      
      // Clear data from all stores on logout
      clearWishlist();
      clearCart();
      clearAddresses();
      clearOrders();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
