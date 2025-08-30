'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from './types'
import { useProductStore } from './productStore'
import { api } from './api'
import { useAuthStore } from './authStore'

export type CartItem = Pick<Product, 'id' | 'name' | 'image'> & {
  qty: number
  price: number
}

type CartState = {
  items: CartItem[]
  subtotal: number
  totalShipping: number
  totalTax: number
  total: number
  isLoading: boolean
  init: (userId: string) => void
  add: (item: CartItem) => Promise<void>
  addToCart: (item: CartItem) => Promise<void>
  remove: (id: string) => Promise<void>
  setQty: (id: string, qty: number) => Promise<void>
  clear: () => Promise<void>
  clearSync: () => void
  syncWithBackend: () => Promise<void>
  loadFromBackend: (userCart: any[]) => void
}

const calculateTotals = (items: CartItem[]) => {
  const products = useProductStore.getState().products;
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  
  // Dynamic shipping cost logic
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);
  let totalShipping = 0;
  if (totalItems > 0) {
    if (totalItems <= 2) {
      totalShipping = 45;
    } else if (totalItems <= 8) {
      totalShipping = 65;
    } else {
      totalShipping = 100;
      const remainingItems = totalItems - 8;
      totalShipping += Math.ceil(remainingItems / 5) * 35;
    }
  }

  const totalTax = items.reduce((acc, cartItem) => {
    const product = products.find(p => p.id === cartItem.id)
    const taxRate = product?.taxPercent || 0
    return acc + (cartItem.price * cartItem.qty * (taxRate / 100));
  }, 0)
  const total = subtotal + totalShipping + totalTax
  return { subtotal, totalShipping, totalTax, total }
}

const STORAGE_KEY = 'shopweve_cart'

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      totalShipping: 0,
      totalTax: 0,
      total: 0,
      isLoading: false,

      init: (userId: string) => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const items = JSON.parse(stored)
            const totals = calculateTotals(items)
            set({ items, ...totals })
          }
        }
      },

      add: async (item: CartItem) => {
        const { user } = useAuthStore.getState();
        set({ isLoading: true });
        
        try {
          const items = get().items;
          const existingItem = items.find(i => i.id === item.id);
          let newItems;
          
          if (existingItem) {
            newItems = items.map(i =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            );
          } else {
            newItems = [...items, { ...item, qty: 1 }];
          }
          
          const totals = calculateTotals(newItems);
          set({ items: newItems, ...totals });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
          }
          
          // Add to backend if user is logged in
          if (user?.phoneNumber) {
            try {
              const qty = existingItem ? existingItem.qty + 1 : 1;
              const result = await api.updateCart(user.phoneNumber, item.id, qty);
              if (!result.success) {
                console.error('Failed to update cart on backend, but continuing with local update');
              }
            } catch (error) {
              console.error('Error calling updateCart API:', error);
              // Continue with local update even if API fails
            }
          }
        } catch (error) {
          console.error('Error adding item to cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addToCart: async (item: CartItem) => {
        return get().add(item);
      },

      remove: async (id: string) => {
        const { user } = useAuthStore.getState();
        set({ isLoading: true });
        
        try {
          const newItems = get().items.filter(item => item.id !== id);
          const totals = calculateTotals(newItems);
          set({ items: newItems, ...totals });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
          }
          
          // Remove from backend if user is logged in
          if (user?.phoneNumber) {
            try {
              const result = await api.removeFromCart(user.phoneNumber, id);
              if (!result.success) {
                console.error('Failed to remove from cart on backend, but continuing with local removal');
              }
            } catch (error) {
              console.error('Error calling removeFromCart API:', error);
              // Continue with local removal even if API fails
            }
          }
        } catch (error) {
          console.error('Error removing item from cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setQty: async (id: string, qty: number) => {
        if (qty <= 0) {
          await get().remove(id);
          return;
        }
        
        const { user } = useAuthStore.getState();
        set({ isLoading: true });
        
        try {
          const newItems = get().items.map(item =>
            item.id === id ? { ...item, qty } : item
          );
          const totals = calculateTotals(newItems);
          set({ items: newItems, ...totals });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
          }
          
          // Update backend if user is logged in
          if (user?.phoneNumber) {
            try {
              const result = await api.updateCart(user.phoneNumber, id, qty);
              if (!result.success) {
                console.error('Failed to update cart quantity on backend, but continuing with local update');
              }
            } catch (error) {
              console.error('Error calling updateCart API for quantity:', error);
              // Continue with local update even if API fails
            }
          }
        } catch (error) {
          console.error('Error updating cart quantity:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clear: async () => {
        const { user } = useAuthStore.getState();
        set({ isLoading: true });
        
        try {
          const items = get().items;
          const totals = calculateTotals([]);
          set({ items: [], ...totals });
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          }
          
          // Clear backend cart if user is logged in
          if (user?.phoneNumber) {
            for (const item of items) {
              await api.removeFromCart(user.phoneNumber, item.id);
            }
          }
        } catch (error) {
          console.error('Error clearing cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearSync: () => {
        const totals = calculateTotals([]);
        set({ items: [], ...totals, isLoading: false });
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
      },

      syncWithBackend: async () => {
        const { user } = useAuthStore.getState();
        if (!user?.phoneNumber) return;
        
        set({ isLoading: true });
        try {
          const items = get().items;
          for (const item of items) {
            await api.updateCart(user.phoneNumber, item.id, item.qty);
          }
        } catch (error) {
          console.error('Error syncing cart with backend:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromBackend: async (userCart: any[]) => {
        if (!userCart || userCart.length === 0) return;
        
        set({ isLoading: true });
        try {
          // Convert backend cart format to frontend format
          const cartItems = userCart.map(item => ({
            id: item.productId,
            name: item.name || 'Product',
            price: item.price || 0,
            image: item.image || '/placeholder.jpg',
            qty: item.qty || 1
          }));
          
          const totals = calculateTotals(cartItems);
          set({ items: cartItems, ...totals });
          
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
          }
          
          console.log('Loaded cart from backend:', cartItems);
        } catch (error) {
          console.error('Error loading cart from backend:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Initialize on load
if (typeof window !== 'undefined') {
  useCart.getState().init('')
}