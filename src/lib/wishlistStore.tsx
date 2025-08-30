'use client'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import { useAuthStore } from './authStore';

interface WishlistState {
  ids: string[];
  isLoading: boolean;
  toggle: (id: string) => Promise<void>;
  toggleWishlist: (id: string) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clear: () => Promise<void>
  clearSync: () => void;
  syncWithBackend: () => Promise<void>;
  loadFromBackend: (userWishlist: any[]) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      isLoading: false,
      
      toggle: async (id) => {
        const { user } = useAuthStore.getState();
        set({ isLoading: true });
        
        try {
          const ids = get().ids;
          let newIds;
          
          if (ids.includes(id)) {
            newIds = ids.filter(existingId => existingId !== id);
            set({ ids: newIds });
            
            // Remove from backend if user is logged in
            if (user?.phoneNumber) {
              const result = await api.removeFromWishlist(user.phoneNumber, id);
              if (!result.success) {
                console.error('Failed to remove from wishlist on backend, but continuing with local removal');
              }
            }
          } else {
            newIds = [...ids, id];
            set({ ids: newIds });
            
            // Add to backend if user is logged in
            if (user?.phoneNumber) {
              await api.addToWishlist(user.phoneNumber, id);
            }
          }
        } catch (error) {
          console.error('Error toggling wishlist item:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      toggleWishlist: async (id: string) => {
        return get().toggle(id);
      },

      isInWishlist: (id: string) => {
        return get().ids.includes(id);
      },

      clear: async () => {
        const { user } = useAuthStore.getState();
        set({ isLoading: true });
        
        try {
          const ids = get().ids;
          set({ ids: [] });
          
          // Clear backend wishlist if user is logged in
          if (user?.phoneNumber) {
            for (const id of ids) {
              await api.removeFromWishlist(user.phoneNumber, id);
            }
          }
        } catch (error) {
          console.error('Error clearing wishlist:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      syncWithBackend: async () => {
        const { user } = useAuthStore.getState();
        if (!user?.phoneNumber) return;
        
        set({ isLoading: true });
        try {
          const ids = get().ids;
          for (const id of ids) {
            await api.addToWishlist(user.phoneNumber, id);
          }
        } catch (error) {
          console.error('Error syncing wishlist with backend:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadFromBackend: (userWishlist: any[]) => {
        if (!userWishlist || userWishlist.length === 0) {
          set({ ids: [] });
          return;
        }
        
        // The backend now sends wishlist as an array of product IDs directly
        set({ ids: [...new Set(userWishlist)] }); // Ensure unique IDs
        
        // Save to localStorage for offline access
        if (typeof window !== 'undefined') {
          localStorage.setItem('wishlist-ids', JSON.stringify(userWishlist));
        }
        
        console.log('Loaded wishlist from backend:', userWishlist);
      },

      // Add a synchronous clear method for logout
      clearSync: () => {
        set({ ids: [], isLoading: false });
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);