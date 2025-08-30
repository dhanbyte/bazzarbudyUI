'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address } from './types'
import { api } from './api'
import { useAuthStore } from './authStore'

type AddressState = {
  addresses: Address[]
  isLoading: boolean
  fetchAddresses: (phoneNumber: string) => Promise<void>
  addAddress: (phoneNumber: string, addressData: Omit<Address, 'id' | 'addedAt'>) => Promise<void>
  updateAddress: (phoneNumber: string, addressId: string, addressData: Partial<Address>) => Promise<void>
  deleteAddress: (phoneNumber: string, addressId: string) => Promise<void>
  setDefaultAddress: (phoneNumber: string, addressId: string) => Promise<void>
  clearAddresses: () => void
  syncWithBackend: () => Promise<void>
  loadFromBackend: (addresses: Address[]) => void
}

export const useAddressBook = create<AddressState>()(persist(
  (set, get) => ({
    addresses: [],
    isLoading: false,

    fetchAddresses: async (phoneNumber) => {
      set({ isLoading: true });
      try {
        const result = await api.getAddresses(phoneNumber);
        if (result.success && result.addresses) {
          set({ addresses: result.addresses, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
        set({ isLoading: false });
      }
    },

    addAddress: async (phoneNumber, addressData) => {
      const tempId = `temp_${Date.now()}`;
      const optimisticAddress = {
        ...addressData,
        id: tempId,
        addedAt: new Date().toISOString()
      };
      
      // Optimistic update - show immediately
      const currentAddresses = get().addresses;
      const newAddresses = [...currentAddresses, optimisticAddress];
      set({ 
        addresses: newAddresses,
        isLoading: true 
      });
      
      // Save optimistic update to localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('shopweve_addresses', JSON.stringify(newAddresses));
      }
      
      try {
        const result = await api.addAddress(phoneNumber, addressData);
        console.log('Address API result:', result);
        
        if (result.success && result.addresses) {
          set({ addresses: result.addresses, isLoading: false });
          
          // Save final result to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('shopweve_addresses', JSON.stringify(result.addresses));
          }
          
          // Update auth store with new addresses
          const { loadUserData, user } = useAuthStore.getState();
          if (user) {
            loadUserData({ ...user, addresses: result.addresses } as any);
          }
          
        } else {
          console.error('Failed to add address:', result);
          // Rollback optimistic update
          set({ addresses: currentAddresses, isLoading: false });
          
          // Rollback localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('shopweve_addresses', JSON.stringify(currentAddresses));
          }
          
          throw new Error('Failed to add address');
        }
      } catch (error) {
        console.error('Failed to add address:', error);
        // Rollback optimistic update
        set({ addresses: currentAddresses, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopweve_addresses', JSON.stringify(currentAddresses));
        }
        throw error; // Re-throw to handle in component
      }
    },

    updateAddress: async (phoneNumber, addressId, addressData) => {
      const currentAddresses = get().addresses;
      
      // Optimistic update - show immediately
      const optimisticAddresses = currentAddresses.map(addr => 
        addr.id === addressId ? { ...addr, ...addressData } : addr
      );
      set({ addresses: optimisticAddresses, isLoading: true });
      
      try {
        const result = await api.updateAddress(phoneNumber, addressId, addressData);
        if (result.success && result.addresses) {
          set({ addresses: result.addresses, isLoading: false });
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('shopweve_addresses', JSON.stringify(result.addresses));
          }
        } else {
          // Revert optimistic update on failure
          set({ addresses: currentAddresses, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to update address:', error);
        // Revert optimistic update on error
        set({ addresses: currentAddresses, isLoading: false });
        throw error;
      }
    },

    deleteAddress: async (phoneNumber, addressId) => {
      set({ isLoading: true });
      try {
        const result = await api.deleteAddress(phoneNumber, addressId);
        if (result.success && result.addresses) {
          set({ addresses: result.addresses });
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('shopweve_addresses', JSON.stringify(result.addresses));
          }
        }
      } catch (error) {
        console.error('Failed to delete address:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    setDefaultAddress: async (phoneNumber, addressId) => {
      const currentAddresses = get().addresses;
      
      // Optimistic update - show immediately
      const optimisticAddresses = currentAddresses.map(addr => ({
        ...addr,
        default: addr.id === addressId
      }));
      set({ addresses: optimisticAddresses, isLoading: true });
      
      try {
        const result = await api.setDefaultAddress(phoneNumber, addressId);
        if (result.success && result.addresses) {
          set({ addresses: result.addresses, isLoading: false });
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('shopweve_addresses', JSON.stringify(result.addresses));
          }
        } else {
          // Revert optimistic update on failure
          set({ addresses: currentAddresses, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to set default address:', error);
        // Revert optimistic update on error
        set({ addresses: currentAddresses, isLoading: false });
        throw error;
      }
    },

    clearAddresses: () => {
      set({ addresses: [], isLoading: false });
    },

    syncWithBackend: async () => {
      const { user } = useAuthStore.getState();
      if (!user?.phoneNumber) return;
      
      set({ isLoading: true });
      try {
        const result = await api.getAddresses(user.phoneNumber);
        if (result.success && result.addresses) {
          set({ addresses: result.addresses });
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('shopweve_addresses', JSON.stringify(result.addresses));
          }
        }
      } catch (error) {
        console.error('Failed to sync addresses with backend:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    loadFromBackend: (addresses) => {
      set({ addresses, isLoading: false });
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('shopweve_addresses', JSON.stringify(addresses));
      }
    },
  }),
  {
    name: 'address-storage',
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.isLoading = false;
        
        // Load from localStorage if available
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('shopweve_addresses');
          if (stored) {
            try {
              const addresses = JSON.parse(stored);
              state.addresses = addresses;
            } catch (error) {
              console.error('Failed to parse stored addresses:', error);
            }
          }
        }
      }
    },
  }
));